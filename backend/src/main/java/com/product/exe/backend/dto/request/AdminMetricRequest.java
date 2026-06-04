package com.product.exe.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminMetricRequest {
    @NotNull(message = "Số thứ tự giai đoạn không được để trống")
    private Integer phaseNumber;

    @NotNull(message = "Số thứ tự tuần không được để trống")
    private Integer weekNumber;

    private Integer dayNumber; // NULL for weekly metrics (Weeks 5-16)

    @NotBlank(message = "Tên chỉ số không được để trống")
    private String metricName;
}
