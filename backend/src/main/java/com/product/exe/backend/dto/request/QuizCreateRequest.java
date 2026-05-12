package com.product.exe.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizCreateRequest {
    @NotBlank(message = "Quiz title is required")
    private String title;

    private String description;

    private String overallAssessment;

    private String imageUrl;

    private String imagePublicId;

    private List<QuizAssessmentRuleRequest> assessmentRules;

    @NotEmpty(message = "Quiz must have at least one question")
    private List<QuestionCreateRequest> questions;
}
