package com.product.exe.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminPaymentResponse {
    private Long id;
    private Long orderCode;
    private String customerName;
    private String customerEmail;
    private String planName;
    private String planTier;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private String status;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
