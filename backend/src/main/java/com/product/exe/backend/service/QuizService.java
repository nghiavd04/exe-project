package com.product.exe.backend.service;

import com.product.exe.backend.dto.request.SubmitAnswerRequest;
import com.product.exe.backend.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface QuizService {
    Page<QuizSummaryResponse> getQuizzes(String search, Pageable pageable);
    QuizDetailResponse getQuizDetail(Long quizId);
    QuizDetailResponse startQuiz(Long quizId, Long userId);
    FeedbackResponse submitAnswer(Long attemptId, SubmitAnswerRequest request, Long userId);
    QuizResultResponse finishQuiz(Long attemptId, Long userId);
}
