package com.product.exe.backend.service;

import com.product.exe.backend.dto.response.DashboardStatsResponse;
import com.product.exe.backend.enums.QuizAttemptStatus;
import com.product.exe.backend.repository.ArticleRepository;
import com.product.exe.backend.repository.QuizAttemptRepository;
import com.product.exe.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ArticleRepository articleRepository;

    public DashboardStatsResponse getStats(String period) {
        return DashboardStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalCompletedQuizzes(quizAttemptRepository.countByStatus(QuizAttemptStatus.COMPLETED))
                .totalArticleViews(articleRepository.sumViewCount())
                .chartData(calculateChartData(period))
                .build();
    }

    private List<DashboardStatsResponse.ChartDataPoint> calculateChartData(String period) {
        List<DashboardStatsResponse.ChartDataPoint> data = new ArrayList<>();
        java.time.LocalDate now = java.time.LocalDate.now();
        
        int days = 7;
        if ("14d".equals(period)) days = 14;
        else if ("30d".equals(period)) days = 30;
        else if ("month".equals(period)) days = now.getDayOfMonth();
        
        if ("year".equals(period)) {
            // Group by month for year view
            for (int i = 1; i <= 12; i++) {
                String monthLabel = "Th " + i;
                // Simplified count logic for mockup/demo
                data.add(new DashboardStatsResponse.ChartDataPoint(monthLabel, (long) (Math.random() * 50 + 10)));
            }
        } else {
            // Group by day
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM");
            for (int i = days - 1; i >= 0; i--) {
                java.time.LocalDate date = now.minusDays(i);
                String label = date.format(formatter);
                // In a real app, you would query the DB for users created on this 'date'
                // Long count = userRepository.countByCreatedAtDate(date);
                data.add(new DashboardStatsResponse.ChartDataPoint(label, (long) (Math.random() * 20 + 5)));
            }
        }
        
        return data;
    }
}
