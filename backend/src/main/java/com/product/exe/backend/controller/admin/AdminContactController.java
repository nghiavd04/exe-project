package com.product.exe.backend.controller.admin;

import com.product.exe.backend.dto.request.ReplyContactRequest;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.dto.response.ContactMessageResponse;
import com.product.exe.backend.service.ContactMessageService;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/contact-messages")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminContactController {

    private final ContactMessageService contactMessageService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ContactMessageResponse>>> getContactMessages(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(required = false) Boolean isReplied,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ContactMessageResponse> messages = contactMessageService.getContactMessages(search, isRead, isReplied, pageable);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<java.util.Map<String, Long>>> getUnreadCount() {
        long count = contactMessageService.getUnreadCount();
        return ResponseEntity.ok(ApiResponse.success(java.util.Map.of("count", count)));
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<ApiResponse<String>> replyMessage(
            @PathVariable Long id,
            @Valid @RequestBody ReplyContactRequest request) {
        Long adminId = getCurrentUserId();
        if (adminId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lòng đăng nhập tài khoản admin"));
        }
        try {
            synchronized (id.toString().intern()) {
                contactMessageService.replyContactMessage(id, request, adminId);
            }
            return ResponseEntity.ok(ApiResponse.success("Phản hồi lời nhắn thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi hệ thống: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        try {
            contactMessageService.markAsRead(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi hệ thống: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteMessage(@PathVariable Long id) {
        try {
            contactMessageService.deleteContactMessage(id);
            return ResponseEntity.ok(ApiResponse.success("Xóa lời nhắn thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi hệ thống: " + e.getMessage()));
        }
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElse(null);
    }
}
