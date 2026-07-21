package com.product.exe.backend.dto.request;

import com.product.exe.backend.enums.NotificationType;
import com.product.exe.backend.enums.SubscriptionTier;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BroadcastNotificationRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255, message = "Tiêu đề tối đa 255 ký tự")
    private String title;

    @NotBlank(message = "Nội dung thông báo không được để trống")
    private String content;

    private String targetEmail;

    private SubscriptionTier targetPlanTier;

    private Boolean sendEmail = false;

    private NotificationType type;
}
