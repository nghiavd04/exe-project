package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.request.SubmitAnswerRequest;
import com.product.exe.backend.dto.response.*;
import com.product.exe.backend.entity.*;
import com.product.exe.backend.enums.QuestionType;
import com.product.exe.backend.enums.QuizAttemptStatus;
import com.product.exe.backend.enums.QuizStatus;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.exception.ResourceNotFoundException;
import com.product.exe.backend.repository.*;
import com.product.exe.backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final CustomerRepository customerRepository;

    @Override
    public Page<QuizSummaryResponse> getQuizzes(String search, Pageable pageable) {
        String searchParam = (search != null && !search.isEmpty()) ? "%" + search.toLowerCase() + "%" : null;
        return quizRepository.findAllByStatusAndSearch(QuizStatus.PUBLISHED, searchParam, pageable)
                .map(this::mapToSummary);
    }

    @Override
    public QuizDetailResponse getQuizDetail(Long quizId) {
        Quiz quiz = quizRepository.findByIdAndStatus(quizId, QuizStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        return mapToDetail(quiz, null);
    }

    @Override
    @Transactional
    public QuizDetailResponse startQuiz(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findByIdAndStatus(quizId, QuizStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        QuizAttempt attempt = QuizAttempt.builder()
                .customer(customer)
                .quiz(quiz)
                .status(QuizAttemptStatus.IN_PROGRESS)
                .startedAt(LocalDateTime.now())
                .build();

        attempt = quizAttemptRepository.save(attempt);

        return mapToDetail(quiz, attempt.getId());
    }

    @Override
    @Transactional
    public FeedbackResponse submitAnswer(Long attemptId, SubmitAnswerRequest request, Long userId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        if (!attempt.getCustomer().getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have permission to access this attempt");
        }

        if (attempt.getStatus() != QuizAttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("This attempt is already finished or expired");
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        if (!question.getQuiz().getId().equals(attempt.getQuiz().getId())) {
            throw new BadRequestException("Question does not belong to this quiz");
        }

        // Check if already answered
        userAnswerRepository.findByAttemptIdAndQuestionId(attemptId, question.getId())
                .ifPresent(a -> { throw new BadRequestException("Question already answered"); });

        if (request.getSelectedAnswerIds() == null || request.getSelectedAnswerIds().isEmpty()) {
            throw new BadRequestException("At least one answer must be selected");
        }

        List<Answer> selectedAnswers = answerRepository.findAllById(request.getSelectedAnswerIds());
        if (selectedAnswers.size() != request.getSelectedAnswerIds().size()) {
            throw new ResourceNotFoundException("One or more answers not found");
        }

        // Validate all answers belong to the question
        for (Answer a : selectedAnswers) {
            if (!a.getQuestion().getId().equals(question.getId())) {
                throw new BadRequestException("Answer ID " + a.getId() + " does not belong to this question");
            }
        }

        if (question.getType() == QuestionType.SINGLE_CHOICE && selectedAnswers.size() > 1) {
            throw new BadRequestException("Single choice questions only accept one answer");
        }

        StringBuilder feedbackBuilder = new StringBuilder();
        for (Answer a : selectedAnswers) {
            UserAnswer userAnswer = UserAnswer.builder()
                    .attempt(attempt)
                    .question(question)
                    .answer(a)
                    .feedbackShown(a.getFeedbackText())
                    .build();
            userAnswerRepository.save(userAnswer);

            if (a.getFeedbackText() != null && !a.getFeedbackText().isEmpty()) {
                if (feedbackBuilder.length() > 0) feedbackBuilder.append("\n\n");
                feedbackBuilder.append(a.getFeedbackText());
            }
        }

        return new FeedbackResponse(feedbackBuilder.toString());
    }

    @Override
    @Transactional
    public QuizResultResponse finishQuiz(Long attemptId, Long userId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        if (!attempt.getCustomer().getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have permission to access this attempt");
        }

        if (attempt.getStatus() == QuizAttemptStatus.IN_PROGRESS) {
            attempt.setStatus(QuizAttemptStatus.COMPLETED);
            attempt.setSubmittedAt(LocalDateTime.now());
            attempt = quizAttemptRepository.save(attempt);
        }

        return QuizResultResponse.builder()
                .attemptId(attempt.getId())
                .overallAssessment(attempt.getQuiz().getOverallAssessment())
                .status(attempt.getStatus().name())
                .build();
    }

    private QuizSummaryResponse mapToSummary(Quiz quiz) {
        return QuizSummaryResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .build();
    }

    private QuizDetailResponse mapToDetail(Quiz quiz, Long attemptId) {
        List<Question> questions = questionRepository.findAllByQuizIdAndIsActiveTrueOrderByOrderIndexAsc(quiz.getId());
        return QuizDetailResponse.builder()
                .id(quiz.getId())
                .attemptId(attemptId)
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .questions(questions.stream().map(this::mapToQuestionDto).collect(Collectors.toList()))
                .build();
    }

    private QuestionDto mapToQuestionDto(Question question) {
        List<Answer> answers = answerRepository.findAllByQuestionIdAndIsActiveTrueOrderByOrderIndexAsc(question.getId());
        return QuestionDto.builder()
                .id(question.getId())
                .content(question.getContent())
                .type(question.getType())
                .orderIndex(question.getOrderIndex())
                .answers(answers.stream().map(this::mapToAnswerDto).collect(Collectors.toList()))
                .build();
    }

    private AnswerDto mapToAnswerDto(Answer answer) {
        return AnswerDto.builder()
                .id(answer.getId())
                .content(answer.getContent())
                .build();
    }
}
