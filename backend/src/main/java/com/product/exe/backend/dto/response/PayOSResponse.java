package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayOSResponse {
    private String checkoutUrl;
    private Long orderCode;
    private BigDecimal amount;
    private String status;
    private String planTier;
}
