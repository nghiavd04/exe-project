package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminQuizAttemptListResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long quizId;
    private String quizTitle;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer totalScore;
    private String assessmentResult;
    private Long durationSeconds;
}
