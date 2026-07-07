package com.product.exe.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ProgramDayDetailResponse {
    private Integer dayNumber;
    private String dayLabel;
    private Integer weekNumber;
    private String weekLabel;
    private String weekRange;
    private Integer phaseNumber;
    private String phaseLabel;
    private String phaseIcon;

    private List<TaskDetail> tasks;
    private List<String> metricsList; // List of metrics names for this day

    // Logged values
    private LoggedDailyData loggedData;

    @Data
    @Builder
    public static class TaskDetail {
        private Integer taskIndex;
        private String title;
        private Boolean isCompleted;
        private Integer dayNumber;
    }

    @Data
    @Builder
    public static class LoggedDailyData {
        private Integer screenTimeMinutes;
        private Integer unconsciousOpenCount;
        private Integer urgeLevel;
        private BigDecimal sleepHours;
        private Integer moodScore;
        private Integer sleepScore;
        private Integer urgeScore;
        private Integer focusScore;
        private String journalText;
    }
}
