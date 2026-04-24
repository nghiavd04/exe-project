package com.product.exe.backend.dto.response;

import com.product.exe.backend.enums.QuizStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminQuizDetailResponse {
    private Long id;
    private String title;
    private String description;
    private String overallAssessment;
    private String imageUrl;
    private String imagePublicId;
    private QuizStatus status;
    private List<AdminQuestionResponse> questions;
}
