package com.product.exe.backend.controller.admin;

import com.product.exe.backend.dto.response.AdminChatSessionResponse;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.entity.ChatMessage;
import com.product.exe.backend.entity.ChatSession;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.enums.ChatSessionType;
import com.product.exe.backend.repository.ChatMessageRepository;
import com.product.exe.backend.repository.ChatSessionRepository;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.service.SystemConfigService;
import com.product.exe.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/ai-chat")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminAiChatController {

    private final SystemConfigService systemConfigService;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;

    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/prompt")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPrompt() {
        String prompt = systemConfigService.getOrSetDefaultValue(
                "GEMINI_SYSTEM_INSTRUCTION",
                "Bạn là Dopaless AI, trợ lý hỗ trợ người dùng xây dựng thói quen sử dụng công nghệ lành mạnh và quản lý dopamine trong cuộc sống hàng ngày.\n\n" +
                "MỤC TIÊU:\n" +
                "- Hỗ trợ người dùng hiểu về dopamine, thói quen, sự tập trung, quản lý thời gian sử dụng mạng xã hội và sức khỏe số.\n" +
                "- Đưa ra lời khuyên mang tính giáo dục, thực tế và an toàn.\n" +
                "- Khuyến khích xây dựng thói quen tích cực, cân bằng cuộc sống và sử dụng công nghệ có ý thức.\n\n" +
                "PHẠM VI ĐƯỢC PHÉP TRẢ LỜI:\n" +
                "- Dopamine và cơ chế phần thưởng trong não.\n" +
                "- Cai nghiện mạng xã hội, TikTok, Facebook, Instagram, YouTube, game.\n" +
                "- Quản lý thời gian sử dụng điện thoại.\n" +
                "- Tập trung học tập và làm việc.\n" +
                "- Xây dựng thói quen tốt.\n" +
                "- Digital Detox.\n" +
                "- Mindfulness cơ bản.\n" +
                "- Quản lý sự trì hoãn.\n" +
                "- Các bài tập giúp giảm phụ thuộc vào thiết bị điện tử.\n" +
                "- Giải thích các bài kiểm tra, thống kê và kết quả đánh giá trong hệ thống Dopaless.\n\n" +
                "KHÔNG ĐƯỢC:\n" +
                "- Trả lời các câu hỏi không liên quan đến dopamine, thói quen, sức khỏe số hoặc mục tiêu của Dopaless.\n" +
                "- Thảo luận chính trị, tôn giáo, tài chính, pháp luật hoặc các chủ đề ngoài phạm vi.\n" +
                "- Đưa ra chẩn đoán y khoa hoặc tâm thần.\n" +
                "- Tuyên bố người dùng mắc bất kỳ bệnh lý nào.\n" +
                "- Đưa ra lời khuyên thay thế bác sĩ hoặc chuyên gia tâm lý.\n" +
                "- Hướng dẫn tự gây hại, bạo lực, chất kích thích hoặc hành vi nguy hiểm.\n" +
                "- Sử dụng ngôn ngữ gây hoảng sợ, kỳ thị hoặc đánh giá người dùng.\n\n" +
                "KHI NGƯỜI DÙNG HỎI NGOÀI PHẠM VI:\n" +
                "Trả lời: \"Tôi là trợ lý của Dopaless và chỉ hỗ trợ các chủ đề liên quan đến dopamine, thói quen, quản lý thời gian sử dụng thiết bị và sức khỏe số. Hãy đặt câu hỏi trong các lĩnh vực này để tôi có thể hỗ trợ bạn.\"\n\n" +
                "LƯU Ý AN TOÀN:\n" +
                "- Luôn giải thích rằng thông tin chỉ mang tính giáo dục.\n" +
                "- Không khẳng định các thông tin y khoa chưa được xác thực.\n" +
                "- Nếu người dùng mô tả tình trạng sức khỏe nghiêm trọng hoặc khủng hoảng tâm lý, khuyến khích họ tìm kiếm sự hỗ trợ từ chuyên gia hoặc cơ sở y tế phù hợp.\n" +
                "- Tránh sử dụng các từ ngữ nhạy cảm hoặc mang tính chẩn đoán như: \"trầm cảm\", \"rối loạn tâm thần\", \"nghiện nặng\", \"bệnh lý não\", trừ khi đang giải thích khái niệm chung một cách trung lập và mang tính giáo dục.\n\n" +
                "PHONG CÁCH TRẢ LỜI:\n" +
                "- Ngắn gọn, thân thiện, dễ hiểu.\n" +
                "- Tập trung vào giải pháp thực tế.\n" +
                "- Ưu tiên các bước hành động cụ thể.\n" +
                "- Không lan man sang chủ đề khác.\n" +
                "- Luôn giữ cuộc trò chuyện xoay quanh mục tiêu cải thiện sức khỏe số và quản lý dopamine."
        );
        return ResponseEntity.ok(ApiResponse.success("Lấy Prompt chỉ dẫn thành công!", Map.of("prompt", prompt)));
    }

    @PutMapping("/prompt")
    public ResponseEntity<ApiResponse<Void>> updatePrompt(@RequestBody Map<String, String> body) {
        String newPrompt = body.get("prompt");
        if (newPrompt == null || newPrompt.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Prompt chỉ dẫn không được để trống"));
        }
        systemConfigService.updateValue("GEMINI_SYSTEM_INSTRUCTION", newPrompt);
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật chỉ dẫn Prompt cho AI thành công!", null));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<Page<AdminChatSessionResponse>>> getSessions(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "type", defaultValue = "AI") ChatSessionType type,
            @RequestParam(name = "search", required = false) String search) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        Page<ChatSession> sessions;
        
        if (search != null && !search.isBlank()) {
            sessions = chatSessionRepository.findAllBySessionTypeAndSearch(type, search, pageable);
        } else {
            sessions = chatSessionRepository.findAllBySessionType(type, pageable);
        }
        
        Page<AdminChatSessionResponse> response = sessions.map(this::mapToResponse);
        return ResponseEntity.ok(ApiResponse.success("Tải danh sách phiên trò chuyện thành công!", response));
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getSessionMessages(@PathVariable(name = "sessionId") Long sessionId) {
        List<ChatMessage> messages = chatMessageRepository.findAllBySessionIdOrderByCreatedAtAsc(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Tải lịch sử tin nhắn thành công!", messages));
    }

    @PostMapping("/sessions/{sessionId}/claim")
    public ResponseEntity<ApiResponse<AdminChatSessionResponse>> claimSession(@PathVariable(name = "sessionId") Long sessionId) {
        Long adminId = getCurrentUserId();
        if (adminId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Vui lòng đăng nhập"));
        }

        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiên hỗ trợ"));
        
        if (session.getSessionType() != ChatSessionType.SUPPORT) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Phiên chat này không thuộc kiểu hỗ trợ trực tiếp."));
        }
        
        com.product.exe.backend.entity.User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản admin"));
        
        // Nếu chưa được gán cho ai, tự động gán cho admin hiện tại
        if (session.getAssignedTo() == null) {
            session.setAssignedTo(admin);
            session = chatSessionRepository.save(session);
            broadcastSessionUpdate(session);
        }
        
        return ResponseEntity.ok(ApiResponse.success("Bắt đầu hỗ trợ phiên chat thành công!", mapToResponse(session)));
    }

    @PostMapping("/sessions/{sessionId}/takeover")
    public ResponseEntity<ApiResponse<AdminChatSessionResponse>> takeoverSession(@PathVariable(name = "sessionId") Long sessionId) {
        Long adminId = getCurrentUserId();
        if (adminId == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Vui lòng đăng nhập"));
        }

        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiên hỗ trợ"));
        
        if (session.getSessionType() != ChatSessionType.SUPPORT) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Phiên chat này không thuộc kiểu hỗ trợ trực tiếp."));
        }
        
        com.product.exe.backend.entity.User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản admin"));
        
        session.setAssignedTo(admin);
        session = chatSessionRepository.save(session);
        
        // Tạo một tin nhắn hệ thống tự động để báo hiệu việc tiếp quản
        ChatMessage systemMsg = ChatMessage.builder()
                .session(session)
                .role("support")
                .content("[HỆ THỐNG] Nhân viên " + admin.getEmail() + " đã tiếp quản cuộc trò chuyện này.")
                .build();
        chatMessageRepository.save(systemMsg);
        
        // Broadcast tin nhắn và cập nhật session qua WebSocket
        messagingTemplate.convertAndSend("/topic/chat/" + sessionId, systemMsg);
        broadcastSessionUpdate(session);
        
        return ResponseEntity.ok(ApiResponse.success("Đã tiếp quản cuộc trò chuyện thành công!", mapToResponse(session)));
    }

    @PostMapping("/sessions/{sessionId}/message")
    public ResponseEntity<ApiResponse<ChatMessage>> sendAdminMessage(
            @PathVariable(name = "sessionId") Long sessionId,
            @RequestBody Map<String, String> body) {
        Long adminId = getCurrentUserId();
        if (adminId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Vui lòng đăng nhập"));
        }

        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiên hỗ trợ"));
        
        if (session.getAssignedTo() == null || !session.getAssignedTo().getId().equals(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Bạn chưa tiếp nhận cuộc trò chuyện này. Vui lòng tiếp quản trước."));
        }
        
        String content = body.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Nội dung tin nhắn không được để trống"));
        }
        
        ChatMessage message = ChatMessage.builder()
                .session(session)
                .role("support")
                .content(content)
                .build();
        chatMessageRepository.save(message);
        
        session.setUpdatedAt(LocalDateTime.now());
        chatSessionRepository.save(session);
        
        // Broadcast tin nhắn qua WebSocket
        messagingTemplate.convertAndSend("/topic/chat/" + sessionId, message);
        
        return ResponseEntity.ok(ApiResponse.success("Gửi tin nhắn thành công!", message));
    }

    private void broadcastSessionUpdate(ChatSession session) {
        Map<String, Object> event = Map.of(
            "eventType", "ASSIGNMENT_UPDATE",
            "sessionId", session.getId(),
            "assignedTo", session.getAssignedTo() != null ? Map.of(
                "id", session.getAssignedTo().getId(),
                "email", session.getAssignedTo().getEmail()
            ) : Map.of()
        );
        messagingTemplate.convertAndSend("/topic/chat/" + session.getId(), (Object) event);
    }

    private AdminChatSessionResponse mapToResponse(ChatSession session) {
        AdminChatSessionResponse.UserSummary userSummary = null;
        if (session.getUser() != null) {
            userSummary = AdminChatSessionResponse.UserSummary.builder()
                    .id(session.getUser().getId())
                    .email(session.getUser().getEmail())
                    .build();
        }
        
        AdminChatSessionResponse.UserSummary assignedToSummary = null;
        if (session.getAssignedTo() != null) {
            assignedToSummary = AdminChatSessionResponse.UserSummary.builder()
                    .id(session.getAssignedTo().getId())
                    .email(session.getAssignedTo().getEmail())
                    .build();
        }
        
        return AdminChatSessionResponse.builder()
                .id(session.getId())
                .title(session.getTitle())
                .user(userSummary)
                .sessionType(session.getSessionType())
                .assignedTo(assignedToSummary)
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        return userRepository.findByEmail(authentication.getName())
                .map(User::getId)
                .orElse(null);
    }
}
