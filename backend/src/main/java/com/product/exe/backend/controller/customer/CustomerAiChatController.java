package com.product.exe.backend.controller.customer;

import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.entity.ChatMessage;
import com.product.exe.backend.entity.ChatSession;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.enums.ChatSessionType;
import com.product.exe.backend.enums.SubscriptionTier;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.service.AiChatService;
import com.product.exe.backend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.product.exe.backend.dto.response.AiChatResponseDto;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/customer/ai-chat")
@RequiredArgsConstructor
public class CustomerAiChatController {

    private final AiChatService aiChatService;
    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<Page<ChatSession>>> getSessions(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "5") int size,
            @RequestParam(name = "type", defaultValue = "AI") ChatSessionType type) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Vui lòng đăng nhập"));
        }
        
        if (type == ChatSessionType.SUPPORT) {
            if (!checkBasicAccess(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Tính năng chat với nhân viên hỗ trợ trực tuyến chỉ dành riêng cho thành viên từ gói BASIC trở lên."));
            }
        } else {
            if (!checkPremiumAccess(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Tính năng AI Chat chỉ dành cho gói Premium trở lên!"));
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatSession> sessions = aiChatService.getSessions(userId, type, pageable);
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }


    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<ChatSession>> createSession(@RequestBody Map<String, String> body) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Vui lòng đăng nhập"));
        }

        String typeStr = body.getOrDefault("type", "AI");
        ChatSessionType type;
        try {
            type = ChatSessionType.valueOf(typeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            type = ChatSessionType.AI;
        }

        if (type == ChatSessionType.SUPPORT) {
            if (!checkBasicAccess(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Tính năng chat với nhân viên hỗ trợ trực tuyến chỉ dành riêng cho thành viên từ gói BASIC trở lên."));
            }
        } else {
            if (!checkPremiumAccess(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Tính năng AI Chat chỉ dành cho gói Premium trở lên!"));
            }
        }

        String title = body.get("title");
        ChatSession session = aiChatService.createSession(userId, title, type);
        return ResponseEntity.ok(ApiResponse.success("Tạo cuộc trò chuyện mới thành công!", session));
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getMessages(
            @PathVariable(name = "sessionId") Long sessionId,
            @RequestParam(name = "limit", required = false) Integer limit) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Vui lòng đăng nhập"));
        }

        try {
            ChatSession session = aiChatService.getSession(userId, sessionId);
            if (session.getSessionType() == ChatSessionType.SUPPORT) {
                if (!checkBasicAccess(userId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error("Tính năng chat với nhân viên hỗ trợ trực tuyến chỉ dành riêng cho thành viên từ gói BASIC trở lên."));
                }
            } else {
                if (!checkPremiumAccess(userId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error("Tính năng AI Chat chỉ dành cho gói Premium trở lên!"));
                }
            }

            List<ChatMessage> messages = aiChatService.getMessages(userId, sessionId, limit);
            return ResponseEntity.ok(ApiResponse.success(messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/sessions/{sessionId}/message")
    public ResponseEntity<ApiResponse<AiChatResponseDto>> sendMessage(@PathVariable(name = "sessionId") Long sessionId, @RequestBody Map<String, String> body) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Vui lòng đăng nhập"));
        }

        try {
            ChatSession session = aiChatService.getSession(userId, sessionId);
            if (session.getSessionType() == ChatSessionType.SUPPORT) {
                if (!checkBasicAccess(userId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error("Tính năng chat với nhân viên hỗ trợ trực tuyến chỉ dành riêng cho thành viên từ gói BASIC trở lên."));
                }
            } else {
                if (!checkPremiumAccess(userId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error("Tính năng AI Chat chỉ dành cho gói Premium trở lên!"));
                }
            }

            String content = body.get("content");
            AiChatResponseDto message = aiChatService.sendMessage(userId, sessionId, content);
            return ResponseEntity.ok(ApiResponse.success(message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<String>> deleteSession(@PathVariable(name = "sessionId") Long sessionId) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Vui lòng đăng nhập"));
        }

        try {
            ChatSession session = aiChatService.getSession(userId, sessionId);
            if (session.getSessionType() == ChatSessionType.SUPPORT) {
                if (!checkBasicAccess(userId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error("Tính năng chat với nhân viên hỗ trợ trực tuyến chỉ dành riêng cho thành viên từ gói BASIC trở lên."));
                }
            } else {
                if (!checkPremiumAccess(userId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error("Tính năng AI Chat chỉ dành cho gói Premium trở lên!"));
                }
            }

            aiChatService.deleteSession(userId, sessionId);
            return ResponseEntity.ok(ApiResponse.success("Đã xóa cuộc trò chuyện thành công!", "Đã xóa"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Vui lòng đăng nhập"));
        }
        long count = aiChatService.getUnreadCountForUser(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
    }

    @PutMapping("/mark-read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Vui lòng đăng nhập"));
        }
        aiChatService.markAllAsReadForUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đọc tất cả tin nhắn", null));
    }

    private boolean checkPremiumAccess(Long userId) {
        SubscriptionTier tier = subscriptionService.getUserHighestTier(userId);
        return tier.getWeight() >= SubscriptionTier.PREMIUM.getWeight();
    }

    private boolean checkBasicAccess(Long userId) {
        SubscriptionTier tier = subscriptionService.getUserHighestTier(userId);
        return tier.getWeight() >= SubscriptionTier.BASIC.getWeight();
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
