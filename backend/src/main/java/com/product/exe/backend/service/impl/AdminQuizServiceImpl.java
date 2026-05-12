package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.request.AnswerCreateRequest;
import com.product.exe.backend.dto.request.QuestionCreateRequest;
import com.product.exe.backend.dto.request.QuizCreateRequest;
import com.product.exe.backend.dto.response.*;
import com.product.exe.backend.entity.Admin;
import com.product.exe.backend.entity.Answer;
import com.product.exe.backend.entity.Question;
import com.product.exe.backend.entity.Quiz;
import com.product.exe.backend.enums.QuizStatus;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.exception.ResourceNotFoundException;
import com.product.exe.backend.repository.*;
import com.product.exe.backend.entity.QuizAssessmentRule;
import com.product.exe.backend.dto.request.QuizAssessmentRuleRequest;
import com.product.exe.backend.service.AdminQuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminQuizServiceImpl implements AdminQuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final AdminRepository adminRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final QuizAssessmentRuleRepository assessmentRuleRepository;

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

            QuizStatus quizStatus = QuizStatus.valueOf((String) row[2]);
            return AdminQuizResponse.builder()
                .id(((Number) row[0]).longValue())
                .title((String) row[1])
                .status(quizStatus)
                .statusDisplayName(quizStatus.getDisplayName())
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
        
        // Soft delete
        List<Question> questions = questionRepository.findAllByQuizIdAndIsActiveTrueOrderByOrderIndexAsc(id);
        for (Question q : questions) {
            answerRepository.markAllAsInactiveByQuestionId(q.getId());
        }
        questionRepository.markAllAsInactiveByQuizId(id);
        assessmentRuleRepository.markAllAsInactiveByQuizId(id);
        
        quiz.setStatus(QuizStatus.ARCHIVED); // Archive instead of physical delete
        quizRepository.save(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminQuizDetailResponse getQuizDetail(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        List<AdminQuestionResponse> questionDtos = List.of();
        if (quiz.getQuestions() != null) {
            questionDtos = quiz.getQuestions().stream()
                .map(q -> {
                    List<AdminAnswerResponse> answerDtos = List.of();
                    if (q.getAnswers() != null) {
                        answerDtos = q.getAnswers().stream()
                            .map(a -> AdminAnswerResponse.builder()
                                .id(a.getId())
                                .content(a.getContent())
                                .value(a.getValue())

                                .orderIndex(a.getOrderIndex())
                                .build())
                            .collect(Collectors.toList());
                    }
                    return AdminQuestionResponse.builder()
                        .id(q.getId())
                        .content(q.getContent())
                        .type(q.getType())
                        .orderIndex(q.getOrderIndex())
                        .answers(answerDtos)
                        .build();
                })
                .collect(Collectors.toList());
        }

        List<QuizAssessmentRuleDto> assessmentRuleDtos = List.of();
        if (quiz.getAssessmentRules() != null) {
            assessmentRuleDtos = quiz.getAssessmentRules().stream()
                .filter(QuizAssessmentRule::getIsActive)
                .map(r -> QuizAssessmentRuleDto.builder()
                    .id(r.getId())
                    .minScore(r.getMinScore())
                    .maxScore(r.getMaxScore())
                    .resultText(r.getResultText())
                    .build())
                .collect(Collectors.toList());
        }

        return AdminQuizDetailResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .overallAssessment(quiz.getOverallAssessment())
                .imageUrl(quiz.getImageUrl())
                .imagePublicId(quiz.getImagePublicId())
                .status(quiz.getStatus())
                .assessmentRules(assessmentRuleDtos)
                .questions(questionDtos)
                .build();
    }

    @Override
    @Transactional
    public void createQuiz(QuizCreateRequest request, Long userId) {
        Admin admin = adminRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin profile not found"));

        Quiz quiz = Quiz.builder()
                .admin(admin)
                .title(request.getTitle())
                .description(request.getDescription())
                .overallAssessment(request.getOverallAssessment())
                .imageUrl(request.getImageUrl())
                .imagePublicId(request.getImagePublicId())
                .status(QuizStatus.DRAFT)
                .build();

        quiz = quizRepository.save(quiz);

        saveAssessmentRules(quiz, request.getAssessmentRules());
        saveQuestionsAndAnswers(quiz, request.getQuestions());
    }

    @Override
    @Transactional
    public void updateQuiz(Long id, QuizCreateRequest request) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        if (quiz.getStatus() == QuizStatus.PUBLISHED) {
            throw new BadRequestException("Cannot edit a published quiz. Please archive it first.");
        }

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setOverallAssessment(request.getOverallAssessment());
        quiz.setImageUrl(request.getImageUrl());
        quiz.setImagePublicId(request.getImagePublicId());
        quizRepository.save(quiz);

        // Soft delete old ones
        List<Question> oldQuestions = questionRepository.findAllByQuizIdAndIsActiveTrueOrderByOrderIndexAsc(id);
        for (Question q : oldQuestions) {
            answerRepository.markAllAsInactiveByQuestionId(q.getId());
        }
        questionRepository.markAllAsInactiveByQuizId(id);
        assessmentRuleRepository.markAllAsInactiveByQuizId(id);

        // Save new ones
        saveAssessmentRules(quiz, request.getAssessmentRules());
        saveQuestionsAndAnswers(quiz, request.getQuestions());
    }

    private void saveAssessmentRules(Quiz quiz, List<QuizAssessmentRuleRequest> ruleRequests) {
        if (ruleRequests != null) {
            for (QuizAssessmentRuleRequest rReq : ruleRequests) {
                QuizAssessmentRule rule = QuizAssessmentRule.builder()
                        .quiz(quiz)
                        .minScore(rReq.getMinScore())
                        .maxScore(rReq.getMaxScore())
                        .resultText(rReq.getResultText())
                        .build();
                assessmentRuleRepository.save(rule);
            }
        }
    }

    private void saveQuestionsAndAnswers(Quiz quiz, List<QuestionCreateRequest> questionRequests) {
        for (QuestionCreateRequest qReq : questionRequests) {
            Question question = Question.builder()
                    .quiz(quiz)
                    .content(qReq.getContent())
                    .type(qReq.getType())
                    .orderIndex(qReq.getOrderIndex())
                    .build();
            
            question = questionRepository.save(question);

            for (AnswerCreateRequest aReq : qReq.getAnswers()) {
                Answer answer = Answer.builder()
                        .question(question)
                        .content(aReq.getContent())
                        .value(aReq.getValue())

                        .orderIndex(aReq.getOrderIndex())
                        .build();
                answerRepository.save(answer);
            }
        }
    }
}

