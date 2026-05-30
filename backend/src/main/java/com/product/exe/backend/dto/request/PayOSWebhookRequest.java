package com.product.exe.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayOSWebhookRequest {
    private String code;
    private String desc;
    private PayOSWebhookData data;
    private String signature;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PayOSWebhookData {
        private Long orderCode;
        private BigDecimal amount;
        private String description;
        private String reference;
        private String transactionDateTime;
        private String paymentLinkId;
    }
}
