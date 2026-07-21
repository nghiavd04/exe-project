package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminQuizAttemptChartPoint {
    private String label;
    private Long totalAttempts;
    private Long completedAttempts;
    private Long abandonedAttempts;
}
