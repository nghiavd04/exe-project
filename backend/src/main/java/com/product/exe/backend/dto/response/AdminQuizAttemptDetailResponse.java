package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminQuizAttemptDetailResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String avatarUrl;
    private Long quizId;
    private String quizTitle;
    private String quizDescription;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer totalScore;
    private String assessmentResult;
    private List<QuestionDetail> questions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionDetail {
        private Long questionId;
        private String content;
        private String type;
        private List<Long> selectedAnswerIds;
        private List<AnswerOption> options;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnswerOption {
        private Long id;
        private String content;
        private String value;
    }
}
