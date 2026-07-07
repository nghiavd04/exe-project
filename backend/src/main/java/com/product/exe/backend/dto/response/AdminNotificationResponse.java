package com.product.exe.backend.dto.response;

import com.product.exe.backend.enums.SubscriptionTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminNotificationResponse {
    private Long id;
    private String title;
    private String content;
    private String targetEmail;
    private SubscriptionTier targetPlanTier;
    private com.product.exe.backend.enums.NotificationType type;
    private LocalDateTime createdAt;
}
