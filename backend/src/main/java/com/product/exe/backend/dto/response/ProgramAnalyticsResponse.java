package com.product.exe.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ProgramAnalyticsResponse {
    private Integer currentDay;
    private Integer streakCount;
    private Integer totalCompletedTasks;
    private List<DailyLogData> dailyLogs;
    private List<WeeklyLogData> weeklyLogs;

    @Data
    @Builder
    public static class DailyLogData {
        private Integer dayNumber;
        private Integer screenTimeMinutes;
        private Integer moodScore;
        private Integer urgeLevel;
        private BigDecimal sleepHours;
        private Integer focusScore;
    }

    @Data
    @Builder
    public static class WeeklyLogData {
        private Integer weekNumber;
        private Integer screenTimeAvgMinutes;
        private Integer moodAvgScore;
        private Integer deepWorkAvgMinutes;
        private Integer relationshipSatisfaction;
    }
}
