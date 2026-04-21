package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.response.AdminQuizResponse;
import com.product.exe.backend.dto.response.AdminQuizStatsResponse;
import com.product.exe.backend.entity.Quiz;
import com.product.exe.backend.enums.QuizStatus;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.exception.ResourceNotFoundException;
import com.product.exe.backend.repository.QuizRepository;
import com.product.exe.backend.service.AdminQuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminQuizServiceImpl implements AdminQuizService {

    private final QuizRepository quizRepository;
    private final com.product.exe.backend.repository.QuizAttemptRepository quizAttemptRepository;

    @Override
    public Page<AdminQuizResponse> getQuizzesForAdmin(QuizStatus status, String search, Pageable pageable) {
        String statusStr = (status != null) ? status.name() : null;
        String searchParam = (search != null && !search.isEmpty()) ? "%" + search.toLowerCase() + "%" : null;
        
        Page<Object[]> rawResults = quizRepository.findAllForAdminRaw(statusStr, searchParam, pageable);
        
        return rawResults.map(row -> {
            LocalDateTime createdAt = null;
            Object dateObj = row[3];
            if (dateObj instanceof java.sql.Timestamp) {
                createdAt = ((java.sql.Timestamp) dateObj).toLocalDateTime();
            } else if (dateObj instanceof LocalDateTime) {
                createdAt = (LocalDateTime) dateObj;
            }

            return AdminQuizResponse.builder()
                .id(((Number) row[0]).longValue())
                .title((String) row[1])
                .status(QuizStatus.valueOf((String) row[2]))
                .createdAt(createdAt)
                .attemptCount(((Number) row[4]).longValue())
                .build();
        });
    }

    @Override
    public AdminQuizStatsResponse getQuizStats() {
        try {
            LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            return AdminQuizStatsResponse.builder()
                    .totalQuizzes(quizRepository.count())
                    .attemptsThisMonth(quizAttemptRepository.countByStartedAtAfter(startOfMonth))
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return AdminQuizStatsResponse.builder().totalQuizzes(0L).attemptsThisMonth(0L).build();
        }
    }

    @Override
    @Transactional
    public void publishQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        
        if (quiz.getStatus() != QuizStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT quizzes can be published");
        }
        
        quiz.setStatus(QuizStatus.PUBLISHED);
        quizRepository.save(quiz);
    }

    @Override
    @Transactional
    public void archiveQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        
        if (quiz.getStatus() != QuizStatus.PUBLISHED) {
            throw new IllegalStateException("Only PUBLISHED quizzes can be archived");
        }
        
        quiz.setStatus(QuizStatus.ARCHIVED);
        quizRepository.save(quiz);
    }

    @Override
    @Transactional
    public void unarchiveQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        
        if (quiz.getStatus() != QuizStatus.ARCHIVED) {
            throw new IllegalStateException("Only ARCHIVED quizzes can be unarchived");
        }
        
        quiz.setStatus(QuizStatus.PUBLISHED);
        quizRepository.save(quiz);
    }

    @Override
    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        
        if (quiz.getStatus() != QuizStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT quizzes can be deleted. Please archive others instead.");
        }
        
        quizRepository.delete(quiz);
    }
}
