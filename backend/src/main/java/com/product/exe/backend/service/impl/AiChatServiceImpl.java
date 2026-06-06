package com.product.exe.backend.service.impl;

import com.product.exe.backend.entity.ChatMessage;
import com.product.exe.backend.entity.ChatSession;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.exception.ResourceNotFoundException;
import com.product.exe.backend.repository.ChatMessageRepository;
import com.product.exe.backend.repository.ChatSessionRepository;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.service.AiChatService;
import com.product.exe.backend.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;

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
    private final SubscriptionService subscriptionService;
    private final SimpMessagingTemplate messagingTemplate;

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
            if (tier != SubscriptionTier.ELITE) {
                throw new BadRequestException("Tính năng chat với nhân viên hỗ trợ trực tuyến chỉ dành riêng cho thành viên gói ELITE.");
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
    public ChatMessage sendMessage(Long userId, Long sessionId, String content) {
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
            return userMessage;
        }

        // Nếu là phiên chat với AI (AI)
        List<ChatMessage> history = chatMessageRepository.findAllBySessionIdOrderByCreatedAtAsc(sessionId);

        // 1. Lưu tin nhắn của User vào DB
        ChatMessage userMessage = ChatMessage.builder()
                .session(session)
                .role("user")
                .content(content)
                .build();
        chatMessageRepository.save(userMessage);

        // 2. Gọi Gemini API để lấy câu trả lời
        String responseContent = geminiService.getChatResponse(history, content);

        // 3. Lưu câu trả lời của AI (model) vào DB và trả về
        ChatMessage aiMessage = ChatMessage.builder()
                .session(session)
                .role("model")
                .content(responseContent)
                .build();
        return chatMessageRepository.save(aiMessage);
    }

    @Override
    @Transactional
    public void deleteSession(Long userId, Long sessionId) {
        ChatSession session = validateSessionOwnership(userId, sessionId);
        chatMessageRepository.deleteAllBySessionId(sessionId);
        chatSessionRepository.delete(session);
    }

    private ChatSession validateSessionOwnership(Long userId, Long sessionId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hội thoại"));
        if (!session.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền truy cập cuộc hội thoại này");
        }
        return session;
    }
}
