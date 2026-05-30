package com.product.exe.backend.controller.customer;

import com.product.exe.backend.dto.request.PayOSWebhookRequest;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.dto.response.PayOSResponse;
import com.product.exe.backend.service.PayOSService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customer/subscription-plans/payos")
@RequiredArgsConstructor
@Slf4j
public class PayOSPaymentController {

    private final PayOSService payOSService;

    @PostMapping("/create-link")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PayOSResponse>> createPaymentLink(
            @RequestBody CreateLinkRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        PayOSResponse response = payOSService.createPaymentLink(request.getPlanId(), email);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody PayOSWebhookRequest webhookBody) {
        log.info("PayOS webhook callback received: code={}, desc={}", webhookBody.getCode(), webhookBody.getDesc());
        try {
            payOSService.handleWebhook(webhookBody);
        } catch (Exception e) {
            log.error("Error processing PayOS webhook", e);
            // Vẫn trả về 200 OK để PayOS không gửi đi gửi lại webhook trong trường hợp có lỗi nghiệp vụ
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sync/{orderCode}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PayOSResponse>> syncStatus(@PathVariable Long orderCode) {
        log.info("PayOS manual sync requested for orderCode {}", orderCode);
        PayOSResponse response = payOSService.syncPaymentStatus(orderCode);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Data
    public static class CreateLinkRequest {
        private Long planId;
    }
}
