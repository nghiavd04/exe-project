package com.product.exe.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerCreateRequest {
    @NotBlank(message = "Answer content is required")
    private String content;

    @NotBlank(message = "Answer value is required")
    private String value;

    private String feedbackText;

    @NotNull(message = "Order index is required")
    private Integer orderIndex;
}
