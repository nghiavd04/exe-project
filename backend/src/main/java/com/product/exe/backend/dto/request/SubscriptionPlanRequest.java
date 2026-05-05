package com.product.exe.backend.dto.request;

import com.product.exe.backend.enums.SubscriptionTier;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlanRequest {
    
    @NotBlank(message = "Tên gói không được để trống")
    private String name;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0.0", message = "Giá không được âm")
    private BigDecimal price;

    @NotNull(message = "Thời hạn không được để trống")
    @Min(value = 1, message = "Thời hạn phải ít nhất 1 ngày")
    private Integer durationDays;

    @NotNull(message = "Cấp độ gói không được để trống")
    private SubscriptionTier tier;

    private String description;
    
    private Boolean isActive;
}
