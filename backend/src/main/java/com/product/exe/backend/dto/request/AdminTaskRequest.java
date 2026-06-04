package com.product.exe.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminTaskRequest {
    @NotNull(message = "Số thứ tự giai đoạn không được để trống")
    private Integer phaseNumber;

    @NotNull(message = "Số thứ tự tuần không được để trống")
    private Integer weekNumber;

    private Integer dayNumber; // NULL for weekly tasks (Weeks 5-16)

    @NotNull(message = "Vị trí nhiệm vụ không được để trống")
    private Integer taskIndex;

    @NotBlank(message = "Tiêu đề nhiệm vụ không được để trống")
    private String title;

    private String subText;
    private String badge;
}
