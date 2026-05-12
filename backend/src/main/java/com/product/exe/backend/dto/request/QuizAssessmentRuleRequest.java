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
public class QuizAssessmentRuleRequest {
    @NotNull(message = "Minimum score is required")
    private Integer minScore;

    @NotNull(message = "Maximum score is required")
    private Integer maxScore;

    @NotBlank(message = "Result text is required")
    private String resultText;
}
