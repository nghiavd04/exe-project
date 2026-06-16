package com.product.exe.backend.controller.admin;

import com.product.exe.backend.dto.request.BroadcastNotificationRequest;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.product.exe.backend.dto.response.AdminNotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
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
            notificationService.createTargetedNotification(
                    request.getTitle(),
                    request.getContent(),
                    request.getTargetEmail(),
                    request.getTargetPlanTier()
            );
            return ResponseEntity.ok(ApiResponse.success("Gửi thông báo thành công!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi hệ thống: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminNotificationResponse>>> getSentNotifications(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            Page<AdminNotificationResponse> notifications = notificationService.getSentNotifications(pageable);
            return ResponseEntity.ok(ApiResponse.success(notifications));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi hệ thống: " + e.getMessage()));
        }
    }
}
