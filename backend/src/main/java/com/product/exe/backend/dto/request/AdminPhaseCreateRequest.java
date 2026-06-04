package com.product.exe.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminPhaseCreateRequest {
    @NotNull(message = "Số thứ tự giai đoạn không được để trống")
    private Integer phaseNumber;

    @NotBlank(message = "Nhãn giai đoạn không được để trống")
    private String label;

    @NotBlank(message = "Khoảng ngày/tuần không được để trống")
    private String rangeText;

    @NotBlank(message = "Icon không được để trống")
    private String icon;

    @NotBlank(message = "Mục tiêu khoa học không được để trống")
    private String focus;

    @NotBlank(message = "Cơ sở khoa học không được để trống")
    private String science;
}
