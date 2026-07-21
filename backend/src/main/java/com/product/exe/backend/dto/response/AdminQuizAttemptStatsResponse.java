package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminQuizAttemptStatsResponse {
    private Long totalAttempts;
    private Long attemptsToday;
    private Long completedAttempts;
    private Long inProgressAttempts;
    private Long abandonedAttempts; // EXPIRED
    private Long uniqueUsers;
    private Double averageScore;
    private Double completionRate;
}
