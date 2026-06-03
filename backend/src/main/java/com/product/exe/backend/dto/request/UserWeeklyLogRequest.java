package com.product.exe.backend.dto.request;

import lombok.Data;

@Data
public class UserWeeklyLogRequest {
    private Integer screenTimeAvgMinutes;
    private Integer moodAvgScore;
    private Integer deepWorkAvgMinutes;
    private Integer outputCount;
    private Integer socialMediaAvgMinutes;
    private Integer streakCount;
    private Integer relationshipSatisfaction;
}
