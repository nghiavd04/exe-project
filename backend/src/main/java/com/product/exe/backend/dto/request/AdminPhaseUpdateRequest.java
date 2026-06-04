package com.product.exe.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminPhaseUpdateRequest {
    @NotBlank(message = "Mục tiêu khoa học không được để trống")
    private String focus;

    @NotBlank(message = "Cơ sở khoa học không được để trống")
    private String science;
}
