package com.product.exe.backend.controller.admin;

import com.product.exe.backend.dto.response.AdminPaymentResponse;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.enums.PaymentStatus;
import com.product.exe.backend.service.AdminSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/subscriptions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSubscriptionController {

    private final AdminSubscriptionService adminSubscriptionService;

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<Page<AdminPaymentResponse>>> getPaymentHistory(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable) {
        
        return ResponseEntity.ok(ApiResponse.success(
                adminSubscriptionService.getPaymentHistory(status, search, pageable)
        ));
    }
}
