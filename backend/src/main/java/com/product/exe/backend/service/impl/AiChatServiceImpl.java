package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.response.AiChatResponseDto;
import com.product.exe.backend.dto.response.SuggestionItem;
import com.product.exe.backend.entity.ChatMessage;
import com.product.exe.backend.entity.ChatSession;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.exception.GeminiRateLimitException;
import com.product.exe.backend.exception.ResourceNotFoundException;
import com.product.exe.backend.repository.ChatMessageRepository;
import com.product.exe.backend.repository.ChatSessionRepository;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.service.AiChatService;
import com.product.exe.backend.service.ContentSuggestionService;
import com.product.exe.backend.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import com.product.exe.backend.enums.ChatSessionType;
import com.product.exe.backend.service.SubscriptionService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.product.exe.backend.enums.SubscriptionTier;
import java.util.Optional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.util.ArrayList;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AiChatServiceImpl implements AiChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final ContentSuggestionService contentSuggestionService;
    private final SubscriptionService subscriptionService;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${gemini.rate-limit.requests-per-minute:10}")
    private int rateLimitPerMinute;

    /** In-memory rate limiter: userId → danh sách timestamps các request gần đây */
    private final ConcurrentHashMap<Long, LinkedList<Long>> userRequestTimestamps = new ConcurrentHashMap<>();

    @Override
    @Transactional
    public Page<ChatSession> getSessions(Long userId, ChatSessionType sessionType, Pageable pageable) {
        chatSessionRepository.deleteEmptySessionsByUserId(userId);
        return chatSessionRepository.findAllByUserIdAndSessionTypeOrderByUpdatedAtDesc(userId, sessionType, pageable);
    }


    @Override
    @Transactional
    public ChatSession createSession(Long userId, String title, ChatSessionType sessionType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (sessionType == ChatSessionType.SUPPORT) {
            SubscriptionTier tier = subscriptionService.getUserHighestTier(userId);
            if (tier.getWeight() < SubscriptionTier.BASIC.getWeight()) {
                throw new BadRequestException("Tính năng chat với nhân viên hỗ trợ trực tuyến chỉ dành riêng cho thành viên từ gói BASIC trở lên.");
            }
            Optional<ChatSession> existingSession = chatSessionRepository.findFirstByUserIdAndSessionType(userId, ChatSessionType.SUPPORT);
            if (existingSession.isPresent()) {
                return existingSession.get();
            }
        }
        
        ChatSession session = ChatSession.builder()
                .title(title == null || title.isBlank() ? "Cuộc hội thoại mới" : title)
                .user(user)
                .sessionType(sessionType)
                .build();
        return chatSessionRepository.save(session);
    }

    @Override
    public List<ChatMessage> getMessages(Long userId, Long sessionId, Integer limit) {
        ChatSession session = validateSessionOwnership(userId, sessionId);
        if (limit == null) {
            return chatMessageRepository.findAllBySessionIdOrderByCreatedAtAsc(sessionId);
        } else {
            PageRequest pageable = PageRequest.of(
                0, limit, Sort.by("createdAt").descending()
            );
            List<ChatMessage> list = new ArrayList<>(chatMessageRepository.findAllBySessionId(sessionId, pageable));
            Collections.reverse(list);
            return list;
        }
    }

    @Override
    @Transactional
    public AiChatResponseDto sendMessage(Long userId, Long sessionId, String content) {
        if (content == null || content.isBlank()) {
            throw new BadRequestException("Nội dung tin nhắn không được để trống");
        }

        ChatSession session = validateSessionOwnership(userId, sessionId);

        // Cập nhật tiêu đề session tự động dựa trên tin nhắn đầu tiên nếu tiêu đề là mặc định
        if ("Cuộc hội thoại mới".equals(session.getTitle())) {
            String newTitle = content.length() > 30 ? content.substring(0, 27) + "..." : content;
            session.setTitle(newTitle);
        }
        session.setUpdatedAt(LocalDateTime.now());
        chatSessionRepository.save(session);

        // Nếu là phiên chat hỗ trợ trực tiếp với nhân viên (SUPPORT)
        if (session.getSessionType() == ChatSessionType.SUPPORT) {
            ChatMessage userMessage = ChatMessage.builder()
                    .session(session)
                    .role("user")
                    .content(content)
                    .build();
            chatMessageRepository.save(userMessage);

            // Phát tin nhắn qua kênh WebSocket của phòng chat
            messagingTemplate.convertAndSend("/topic/chat/" + sessionId, userMessage);

            // Bắn tín hiệu Notification Global cho màn hình Admin
            java.util.Map<String, Object> alertPayload = java.util.Map.of(
                "eventType", "NEW_MESSAGE",
                "sessionId", sessionId,
                "message", "Có tin nhắn mới từ khách hàng " + session.getUser().getEmail()
            );
            messagingTemplate.convertAndSend("/topic/admin/chat/alerts", (Object) alertPayload);

            // SUPPORT chat không gợi ý nội dung AI
            return AiChatResponseDto.builder()
                    .aiText(content)
                    .messageId(userMessage.getId())
                    .suggestions(Collections.emptyList())
                    .build();
        }

        // Nếu là phiên chat với AI (AI)
        // Rate limit check: giới hạn số request mỗi user/phút
        checkRateLimit(userId);

        List<ChatMessage> history = chatMessageRepository.findAllBySessionIdOrderByCreatedAtAsc(sessionId);

        // 1. Tìm nội dung liên quan trong hệ thống để làm context gợi ý
        List<SuggestionItem> suggestions = contentSuggestionService.findSuggestions(content, 3);
        String contextHint = contentSuggestionService.formatContextHint(suggestions);

        // 2. Lưu tin nhắn của User vào DB
        ChatMessage userMessage = ChatMessage.builder()
                .session(session)
                .role("user")
                .content(content)
                .build();
        chatMessageRepository.save(userMessage);

        // 3. Gọi Gemini API với context hint về nội dung gợi ý
        String responseContent = geminiService.getChatResponse(history, content, contextHint);

        // 4. Lưu câu trả lời của AI (model) vào DB
        ChatMessage aiMessage = ChatMessage.builder()
                .session(session)
                .role("model")
                .content(responseContent)
                .build();
        ChatMessage savedAiMessage = chatMessageRepository.save(aiMessage);

        // 5. Trả về DTO gồm câu trả lời AI + danh sách gợi ý
        return AiChatResponseDto.builder()
                .aiText(responseContent)
                .messageId(savedAiMessage.getId())
                .suggestions(suggestions)
                .build();
    }

    @Override
    @Transactional
    public void deleteSession(Long userId, Long sessionId) {
        ChatSession session = validateSessionOwnership(userId, sessionId);
        chatMessageRepository.deleteAllBySessionId(sessionId);
        chatSessionRepository.delete(session);
    }

    @Override
    @Transactional(readOnly = true)
    public ChatSession getSession(Long userId, Long sessionId) {
        return validateSessionOwnership(userId, sessionId);
    }

    private ChatSession validateSessionOwnership(Long userId, Long sessionId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hội thoại"));
        if (!session.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền truy cập cuộc hội thoại này");
        }
        return session;
    }

    @Override
    public long getUnreadCountForUser(Long userId) {
        return chatMessageRepository.countBySessionUserIdAndRoleNotAndIsReadFalse(userId, "user");
    }

    @Override
    public long getUnreadCountForAdmin() {
        return chatMessageRepository.countDistinctSessionByRoleAndIsReadFalse("user");
    }

    @Override
    @Transactional
    public void markAllAsReadForUser(Long userId) {
        chatMessageRepository.markAllAsReadForUser(userId);
    }

    @Override
    @Transactional
    public void markAllAsReadForSession(Long sessionId, String roleToMarkAsRead) {
        chatMessageRepository.markAllAsReadForSession(sessionId, roleToMarkAsRead);
    }

    /**
     * Kiểm tra rate limit cho user: sliding window 60 giây.
     * Nếu user gửi quá số request cho phép trong 1 phút → throw exception.
     */
    private void checkRateLimit(Long userId) {
        long now = System.currentTimeMillis();
        long windowMs = 60_000L; // 1 phút

        LinkedList<Long> timestamps = userRequestTimestamps.computeIfAbsent(userId, k -> new LinkedList<>());

        synchronized (timestamps) {
            // Xóa các timestamp cũ hơn 1 phút
            while (!timestamps.isEmpty() && (now - timestamps.peekFirst()) > windowMs) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= rateLimitPerMinute) {
                long oldestInWindow = timestamps.peekFirst();
                long waitSeconds = (windowMs - (now - oldestInWindow)) / 1000 + 1;
                throw new GeminiRateLimitException(
                        "Bạn đang gửi tin nhắn quá nhanh. Vui lòng đợi khoảng " + waitSeconds + " giây rồi thử lại."
                );
            }

            timestamps.addLast(now);
        }
    }
}
