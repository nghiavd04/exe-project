package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private Long totalUsers;
    private Long totalQuizzesCompleted;
    private Long totalArticleViews;
    private Double userGrowthRate; // e.g., +12%
    private Double quizGrowthRate;
    private Double viewGrowthRate;
    
    private List<TrafficData> trafficStats;
    private List<RecentActivity> recentActivities;

    @Data
    @Builder
    public static class TrafficData {
        private String date;
        private Long views;
    }

    @Data
    @Builder
    public static class RecentActivity {
        private String userName;
        private String action;
        private String target;
        private String timeAgo;
    }
}
