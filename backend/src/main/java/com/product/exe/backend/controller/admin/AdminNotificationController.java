package com.product.exe.backend.controller.admin;

import com.product.exe.backend.dto.request.BroadcastNotificationRequest;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<ApiResponse<String>> sendBroadcastNotification(
            @Valid @RequestBody BroadcastNotificationRequest request) {
        try {
            notificationService.createBroadcastNotification(request.getTitle(), request.getContent());
            return ResponseEntity.ok(ApiResponse.success("Gửi thông báo hệ thống thành công!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi hệ thống: " + e.getMessage()));
        }
    }
}
