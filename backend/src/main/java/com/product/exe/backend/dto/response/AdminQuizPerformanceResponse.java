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
public class AdminQuizPerformanceResponse {
    private Long quizId;
    private String quizTitle;
    private Long totalAttempts;
    private Long uniqueUsers;
    private Double averageScore;
    private Double completionRate;
    private LocalDateTime lastAttemptAt;
}
