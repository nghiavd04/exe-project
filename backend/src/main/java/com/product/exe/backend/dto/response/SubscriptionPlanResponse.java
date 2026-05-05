package com.product.exe.backend.dto.response;

import com.product.exe.backend.enums.SubscriptionTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlanResponse {
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer durationDays;
    private SubscriptionTier tier;
    private String tierDisplayName;
    private String description;
    private Boolean isActive;
    private Long subscriberCount;
    private LocalDateTime createdAt;
}
