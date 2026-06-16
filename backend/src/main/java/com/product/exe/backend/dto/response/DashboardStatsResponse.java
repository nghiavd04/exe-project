package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    private Long totalUsers;
    private Long activeSubscriptions;
    private java.math.BigDecimal totalRevenue;
    private Long unreadContactMessages;
    
    private List<ChartDataPoint> chartData;
    private List<SubscriptionBreakdownData> subscriptionBreakdown;
    private List<RecentTransactionData> recentTransactions;
    private ContentPerformanceData contentPerformance;
    private AiChatStatsData aiChatStats;
    private ProgramProgressData programProgress;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubscriptionBreakdownData {
        private String planName;
        private Long count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentTransactionData {
        private String customerName;
        private String planName;
        private java.math.BigDecimal amount;
        private com.product.exe.backend.enums.PaymentStatus status;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ContentPerformanceData {
        private List<TopQuizData> topQuizzes;
        private List<TopArticleData> topArticles;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopQuizData {
        private String title;
        private Long attemptCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopArticleData {
        private String title;
        private Long viewCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AiChatStatsData {
        private Long totalSessionsToday;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProgramProgressData {
        private Long totalActiveUsers;
        private Long usersCheckedInToday;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChartDataPoint {
        private String label; 
        private Long value;
    }
}
