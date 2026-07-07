package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.response.DashboardStatsResponse;
import com.product.exe.backend.enums.SubscriptionStatus;
import com.product.exe.backend.enums.PaymentStatus;
import com.product.exe.backend.enums.UserProgramStatus;
import com.product.exe.backend.enums.Role;
import com.product.exe.backend.repository.*;
import com.product.exe.backend.service.DashboardService;
import com.product.exe.backend.entity.Payment;
import com.product.exe.backend.entity.Article;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ArticleRepository articleRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final UserProgramProgressRepository userProgramProgressRepository;

    @Override
    public DashboardStatsResponse getStats(String period) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        return DashboardStatsResponse.builder()
                .totalUsers(userRepository.countByRole(Role.CUSTOMER))
                .activeSubscriptions(userSubscriptionRepository.countByStatus(SubscriptionStatus.ACTIVE))
                .totalRevenue(paymentRepository.sumAmountByStatus(PaymentStatus.SUCCESS))
                .unreadContactMessages(contactMessageRepository.countByIsReadFalse())
                .chartData(calculateChartData(period))
                .subscriptionBreakdown(getSubscriptionBreakdown())
                .recentTransactions(getRecentTransactions())
                .contentPerformance(getContentPerformance())
                .aiChatStats(getAiChatStats(startOfDay))
                .programProgress(getProgramProgress(startOfDay))
                .build();
    }

    private List<DashboardStatsResponse.SubscriptionBreakdownData> getSubscriptionBreakdown() {
        List<Object[]> breakdownData = userSubscriptionRepository.countSubscriptionsByPlanName(SubscriptionStatus.ACTIVE);
        List<DashboardStatsResponse.SubscriptionBreakdownData> breakdown = new ArrayList<>();
        for (Object[] row : breakdownData) {
            String planName = row[0] != null ? row[0].toString() : "Unknown";
            Long count = row[1] != null ? Long.parseLong(row[1].toString()) : 0L;
            breakdown.add(new DashboardStatsResponse.SubscriptionBreakdownData(planName, count));
        }
        return breakdown;
    }

    private List<DashboardStatsResponse.RecentTransactionData> getRecentTransactions() {
        List<Payment> recentPayments = paymentRepository.findTop5ByOrderByCreatedAtDesc();
        return recentPayments.stream().map(p -> com.product.exe.backend.dto.response.DashboardStatsResponse.RecentTransactionData.builder()
                .customerName(p.getCustomer() != null ? p.getCustomer().getFullName() : "Unknown")
                .planName(p.getPlan() != null ? p.getPlan().getName() : "Unknown")
                .amount(p.getAmount())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .build()).toList();
    }

    private DashboardStatsResponse.ContentPerformanceData getContentPerformance() {
        // Quizzes
        List<Object[]> topQuizzesRaw = quizAttemptRepository.findTopQuizzes(PageRequest.of(0, 5)).getContent();
        List<DashboardStatsResponse.TopQuizData> topQuizzes = new ArrayList<>();
        for (Object[] row : topQuizzesRaw) {
            String title = row[0] != null ? row[0].toString() : "Unknown";
            Long attempts = row[1] != null ? Long.parseLong(row[1].toString()) : 0L;
            topQuizzes.add(new com.product.exe.backend.dto.response.DashboardStatsResponse.TopQuizData(title, attempts));
        }

        // Articles
        List<Article> topArticlesRaw = articleRepository.findAllByOrderByViewCountDesc(PageRequest.of(0, 5)).getContent();
        List<DashboardStatsResponse.TopArticleData> topArticles = topArticlesRaw.stream()
                .map(a -> new com.product.exe.backend.dto.response.DashboardStatsResponse.TopArticleData(a.getTitle(), a.getViewCount()))
                .toList();

        return new DashboardStatsResponse.ContentPerformanceData(topQuizzes, topArticles);
    }

    private DashboardStatsResponse.AiChatStatsData getAiChatStats(LocalDateTime startOfDay) {
        return new DashboardStatsResponse.AiChatStatsData(
                chatSessionRepository.countByCreatedAtAfter(startOfDay)
        );
    }

    private DashboardStatsResponse.ProgramProgressData getProgramProgress(LocalDateTime startOfDay) {
        return new DashboardStatsResponse.ProgramProgressData(
                userProgramProgressRepository.countByStatus(UserProgramStatus.ACTIVE),
                userProgramProgressRepository.countByLastCheckedInAtAfter(startOfDay)
        );
    }

    private List<DashboardStatsResponse.ChartDataPoint> calculateChartData(String period) {
        List<DashboardStatsResponse.ChartDataPoint> data = new ArrayList<>();
        LocalDate now = LocalDate.now();
        
        int days = 7;
        if ("14d".equals(period)) days = 14;
        else if ("30d".equals(period)) days = 30;
        else if ("month".equals(period)) days = now.getDayOfMonth();
        
        LocalDateTime startDate = now.minusDays(days - 1).atStartOfDay();

        List<Object[]> revenueData = paymentRepository.sumAmountByDateSinceNative(PaymentStatus.SUCCESS.name(), startDate);
        Map<String, BigDecimal> revenueMap = new HashMap<>();
        
        for (Object[] row : revenueData) {
            String dateStr = String.valueOf(row[0]); // yyyy-MM-dd
            BigDecimal amount = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            
            // Convert yyyy-MM-dd to dd/MM
            try {
                LocalDate date = LocalDate.parse(dateStr);
                revenueMap.put(date.format(DateTimeFormatter.ofPattern("dd/MM")), amount);
            } catch (Exception e) {
                // Ignore parse errors
            }
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = now.minusDays(i);
            String label = date.format(formatter);
            BigDecimal value = revenueMap.getOrDefault(label, BigDecimal.ZERO);
            data.add(new DashboardStatsResponse.ChartDataPoint(label, value.longValue()));
        }
        
        return data;
    }
}
