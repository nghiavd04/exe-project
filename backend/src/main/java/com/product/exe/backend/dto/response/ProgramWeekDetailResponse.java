package com.product.exe.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ProgramWeekDetailResponse {
    private Integer weekNumber;
    private String weekLabel;
    private String weekRange;
    private String description;
    private Integer phaseNumber;
    private String phaseLabel;
    private String phaseIcon;

    private List<TaskDetail> tasks;
    private List<String> metricsList; // List of metrics names for this week

    // Logged values
    private LoggedWeeklyData loggedData;

    @Data
    @Builder
    public static class TaskDetail {
        private Integer taskIndex;
        private String title;
        private Boolean isCompleted;
    }

    @Data
    @Builder
    public static class LoggedWeeklyData {
        private Integer screenTimeAvgMinutes;
        private Integer moodAvgScore;
        private Integer deepWorkAvgMinutes;
        private Integer outputCount;
        private Integer socialMediaAvgMinutes;
        private Integer streakCount;
        private Integer relationshipSatisfaction;
    }
}
