package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserProgressDetailsResponse {
    private Integer currentDay;
    private Integer streakCount;
    private LocalDateTime startedAt;
    private LocalDateTime lastCheckedInAt;
    private String status;
    private String subscriptionPlan;
    private List<DailyLogDto> dailyLogs;
    private List<WeeklyLogDto> weeklyLogs;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyLogDto {
        private Integer dayNumber;
        private Integer screenTimeMinutes;
        private Integer unconsciousOpenCount;
        private Integer urgeLevel;
        private BigDecimal sleepHours;
        private Integer moodScore;
        private Integer sleepScore;
        private Integer urgeScore;
        private Integer focusScore;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WeeklyLogDto {
        private Integer weekNumber;
        private Integer screenTimeAvgMinutes;
        private Integer moodAvgScore;
        private Integer deepWorkAvgMinutes;
        private Integer outputCount;
        private Integer socialMediaAvgMinutes;
        private Integer streakCount;
        private Integer relationshipSatisfaction;
        private LocalDateTime createdAt;
    }
}
