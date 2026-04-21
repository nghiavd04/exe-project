package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttemptDetailResponse {
    private Long id;
    private Long quizId;
    private String quizTitle;
    private String overallAssessment;
    private List<UserAnswerDto> answers;
}
