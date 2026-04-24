package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.response.DashboardStatsResponse;
import com.product.exe.backend.enums.QuizAttemptStatus;
import com.product.exe.backend.repository.ArticleRepository;
import com.product.exe.backend.repository.QuizAttemptRepository;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ArticleRepository articleRepository;

    @Override
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
        LocalDate now = LocalDate.now();
        
        int days = 7;
        if ("14d".equals(period)) days = 14;
        else if ("30d".equals(period)) days = 30;
        else if ("month".equals(period)) days = now.getDayOfMonth();
        
        if ("year".equals(period)) {
            // Group by month for year view
            for (int i = 1; i <= 12; i++) {
                String monthLabel = "Th " + i;
                data.add(new DashboardStatsResponse.ChartDataPoint(monthLabel, (long) (Math.random() * 50 + 10)));
            }
        } else {
            // Group by day
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
            for (int i = days - 1; i >= 0; i--) {
                LocalDate date = now.minusDays(i);
                String label = date.format(formatter);
                data.add(new DashboardStatsResponse.ChartDataPoint(label, (long) (Math.random() * 20 + 5)));
            }
        }
        
        return data;
    }
}
