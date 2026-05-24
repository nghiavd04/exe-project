package com.product.exe.backend.controller.customer;

import com.product.exe.backend.dto.request.ContactRequest;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.service.ContactMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customer/contact")
@RequiredArgsConstructor
public class CustomerContactController {

    private final ContactMessageService contactMessageService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<String>> submitContact(@Valid @RequestBody ContactRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lòng đăng nhập để gửi lời nhắn"));
        }
        try {
            synchronized (userId.toString().intern()) {
                contactMessageService.saveContact(request, userId);
            }
            return ResponseEntity.ok(ApiResponse.success("Gửi lời nhắn thành công!"));
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
