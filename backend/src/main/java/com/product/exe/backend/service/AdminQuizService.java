package com.product.exe.backend.service;

import com.product.exe.backend.dto.request.QuizCreateRequest;
import com.product.exe.backend.dto.response.AdminQuizDetailResponse;
import com.product.exe.backend.dto.response.AdminQuizResponse;
import com.product.exe.backend.dto.response.AdminQuizStatsResponse;
import com.product.exe.backend.enums.QuizStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminQuizService {
    Page<AdminQuizResponse> getQuizzesForAdmin(QuizStatus status, String search, Pageable pageable);
    
    AdminQuizStatsResponse getQuizStats();
    
    void publishQuiz(Long id);
    void archiveQuiz(Long id);
    void unarchiveQuiz(Long id);
    void deleteQuiz(Long id);
    
    AdminQuizDetailResponse getQuizDetail(Long id);

    void createQuiz(QuizCreateRequest request, Long adminId);
    void updateQuiz(Long id, QuizCreateRequest request);
}
