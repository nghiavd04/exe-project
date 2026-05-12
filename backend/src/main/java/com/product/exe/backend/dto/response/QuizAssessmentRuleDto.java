package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAssessmentRuleDto {
    private Long id;
    private Integer minScore;
    private Integer maxScore;
    private String resultText;
}
