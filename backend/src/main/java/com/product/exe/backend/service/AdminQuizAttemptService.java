package com.product.exe.backend.service;

import com.product.exe.backend.dto.response.*;
import com.product.exe.backend.enums.QuizAttemptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;

public interface AdminQuizAttemptService {
    AdminQuizAttemptStatsResponse getStats();
    
    List<AdminQuizAttemptChartPoint> getChart(String period);
    
    List<AdminQuizPerformanceResponse> getPerformanceByQuiz();
    
    Page<AdminQuizAttemptListResponse> getAttempts(
            Long quizId,
            QuizAttemptStatus status,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String keyword,
            Pageable pageable);
            
    AdminQuizAttemptDetailResponse getAttemptDetail(Long id);
    
    List<AdminAssessmentBreakdownResponse> getAssessmentBreakdown(Long quizId);
}
