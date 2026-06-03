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
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final CustomerRepository customerRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public Page<QuizSummaryResponse> getQuizzes(String search, Pageable pageable) {
        String searchParam = (search != null && !search.isEmpty()) ? "%" + search.toLowerCase() + "%" : null;
        return quizRepository.findAllByStatusAndSearch(QuizStatus.PUBLISHED, searchParam, pageable)
                .map(this::mapToSummary);
    }

    @Override
    public QuizDetailResponse getQuizDetail(Long quizId) {
        Quiz quiz = quizRepository.findByIdAndStatus(quizId, QuizStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài trắc nghiệm"));
        return mapToDetail(quiz, null);
    }

    @Override
    @Transactional
    public QuizDetailResponse startQuiz(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findByIdAndStatus(quizId, QuizStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài trắc nghiệm"));

        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin khách hàng"));

        // Generate a unique temporary attempt ID from Redis sequence
        Long tempAttemptId = redisTemplate.opsForValue().increment("quiz:attempt:id:seq");
        if (tempAttemptId == null) {
            throw new BadRequestException("Không thể tạo ID phiên làm bài trắc nghiệm tạm thời");
        }

        // Create temporary attempt state
        RedisQuizAttempt tempAttempt = RedisQuizAttempt.builder()
                .id(tempAttemptId)
                .customerId(customer.getId())
                .quizId(quiz.getId())
                .startedAt(LocalDateTime.now())
                .answers(new java.util.HashMap<>())
                .build();

        // Save to Redis with 2 hours TTL
        try {
            String json = objectMapper.writeValueAsString(tempAttempt);
            redisTemplate.opsForValue().set("quiz:attempt:" + tempAttemptId, json, Duration.ofHours(2));
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize RedisQuizAttempt", e);
            throw new BadRequestException("Lỗi khi khởi tạo phiên làm bài trắc nghiệm");
        }

        return mapToDetail(quiz, tempAttemptId);
    }

    @Override
    @Transactional
    public void submitAnswer(Long attemptId, SubmitAnswerRequest request, Long userId) {
        String key = "quiz:attempt:" + attemptId;
        String json = redisTemplate.opsForValue().get(key);
        if (json == null) {
            log.warn("Redis quiz attempt not found or expired for ID: {}", attemptId);
            throw new BadRequestException("Phiên làm bài này đã hết hạn hoặc không tồn tại");
        }

        RedisQuizAttempt tempAttempt;
        try {
            tempAttempt = objectMapper.readValue(json, RedisQuizAttempt.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize RedisQuizAttempt", e);
            throw new BadRequestException("Lỗi khi xử lý dữ liệu phiên làm bài trắc nghiệm");
        }

        Customer customer = customerRepository.findById(tempAttempt.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));

        if (!customer.getUser().getId().equals(userId)) {
            log.warn("Permission denied for user {} on attempt {}", userId, attemptId);
            throw new BadRequestException("Bạn không có quyền truy cập phiên làm bài này");
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy câu hỏi"));

        if (!question.getQuiz().getId().equals(tempAttempt.getQuizId())) {
            log.warn("Question {} does not belong to quiz {}", question.getId(), tempAttempt.getQuizId());
            throw new BadRequestException("Câu hỏi không thuộc về bài trắc nghiệm này");
        }

        if (request.getSelectedAnswerIds() == null || request.getSelectedAnswerIds().isEmpty()) {
            log.warn("No answers selected for question {} in attempt {}", question.getId(), attemptId);
            throw new BadRequestException("Phải chọn ít nhất một câu trả lời");
        }

        List<Answer> selectedAnswers = answerRepository.findAllById(request.getSelectedAnswerIds());
        if (selectedAnswers.size() != request.getSelectedAnswerIds().size()) {
            log.warn("Some answer IDs not found: expected {}, found {}", request.getSelectedAnswerIds().size(), selectedAnswers.size());
            throw new ResourceNotFoundException("Không tìm thấy một hoặc nhiều câu trả lời");
        }

        // Validate all answers belong to the question
        for (Answer a : selectedAnswers) {
            if (!a.getQuestion().getId().equals(question.getId())) {
                log.warn("Answer {} does not belong to question {}", a.getId(), question.getId());
                throw new BadRequestException("Mã câu trả lời " + a.getId() + " không thuộc về câu hỏi này");
            }
        }

        if (question.getType() == QuestionType.SINGLE_CHOICE && selectedAnswers.size() > 1) {
            log.warn("Multiple answers submitted for single choice question {}", question.getId());
            throw new BadRequestException("Câu hỏi lựa chọn đơn chỉ chấp nhận một câu trả lời");
        }

        // Save selected answers in the map
        tempAttempt.getAnswers().put(request.getQuestionId(), request.getSelectedAnswerIds());

        // Update in Redis and reset/extend the TTL to 2 hours
        try {
            String updatedJson = objectMapper.writeValueAsString(tempAttempt);
            redisTemplate.opsForValue().set(key, updatedJson, Duration.ofHours(2));
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize updated RedisQuizAttempt", e);
            throw new BadRequestException("Lỗi khi lưu câu trả lời");
        }
    }

    @Override
    @Transactional
    public QuizResultResponse finishQuiz(Long attemptId, Long userId) {
        String key = "quiz:attempt:" + attemptId;
        String json = redisTemplate.opsForValue().get(key);
        if (json == null) {
            log.warn("Redis quiz attempt not found or expired for ID: {}", attemptId);
            throw new BadRequestException("This attempt has expired or does not exist");
        }

        RedisQuizAttempt tempAttempt;
        try {
            tempAttempt = objectMapper.readValue(json, RedisQuizAttempt.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize RedisQuizAttempt", e);
            throw new BadRequestException("Error processing quiz attempt data");
        }

        Customer customer = customerRepository.findById(tempAttempt.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));

        if (!customer.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền truy cập phiên làm bài này");
        }

        Quiz quiz = quizRepository.findById(tempAttempt.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài trắc nghiệm"));

        // 1. Create a permanent QuizAttempt in MySQL
        QuizAttempt attempt = QuizAttempt.builder()
                .customer(customer)
                .quiz(quiz)
                .status(QuizAttemptStatus.COMPLETED)
                .startedAt(tempAttempt.getStartedAt())
                .submittedAt(LocalDateTime.now())
                .build();

        attempt = quizAttemptRepository.save(attempt);

        // 2. Save all answers from Redis to MySQL
        for (Map.Entry<Long, List<Long>> entry : tempAttempt.getAnswers().entrySet()) {
            Long questionId = entry.getKey();
            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy câu hỏi"));

            List<Answer> selectedAnswers = answerRepository.findAllById(entry.getValue());
            for (Answer a : selectedAnswers) {
                UserAnswer userAnswer = UserAnswer.builder()
                        .attempt(attempt)
                        .question(question)
                        .answer(a)
                        .build();
                userAnswerRepository.save(userAnswer);
            }
        }

        // 3. Calculate score using the MySQL records (to keep logic identical)
        List<UserAnswer> userAnswers = userAnswerRepository.findAllByAttemptId(attempt.getId());
        int totalScore = 0;
        for (UserAnswer ua : userAnswers) {
            if (ua.getAnswer() != null && ua.getAnswer().getValue() != null) {
                try {
                    totalScore += Integer.parseInt(ua.getAnswer().getValue());
                } catch (NumberFormatException e) {
                    // Ignore non-integer values
                }
            }
        }
        attempt.setTotalScore(totalScore);

        // 4. Determine assessment result
        String resultText = attempt.getQuiz().getOverallAssessment(); // Default fallback
        if (attempt.getQuiz().getAssessmentRules() != null) {
            for (QuizAssessmentRule rule : attempt.getQuiz().getAssessmentRules()) {
                if (totalScore >= rule.getMinScore() && totalScore <= rule.getMaxScore()) {
                    resultText = rule.getResultText();
                    break;
                }
            }
        }
        attempt.setAssessmentResult(resultText);

        attempt = quizAttemptRepository.save(attempt);

        // 5. Delete temporary attempt from Redis
        redisTemplate.delete(key);

        return QuizResultResponse.builder()
                .attemptId(attempt.getId())
                .overallAssessment(attempt.getQuiz().getOverallAssessment())
                .status(attempt.getStatus().name())
                .totalScore(attempt.getTotalScore())
                .assessmentResult(attempt.getAssessmentResult())
                .build();
    }

    private QuizSummaryResponse mapToSummary(Quiz quiz) {
        return QuizSummaryResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .imageUrl(quiz.getImageUrl())
                .build();
    }

    private QuizDetailResponse mapToDetail(Quiz quiz, Long attemptId) {
        List<Question> questions = questionRepository.findAllByQuizIdAndIsActiveTrueOrderByOrderIndexAsc(quiz.getId());
        List<Long> questionIds = questions.stream().map(Question::getId).collect(Collectors.toList());
        
        // Fetch all answers for all questions in one go to avoid N+1 problem
        List<Answer> allAnswers = answerRepository.findAllByQuestionIdInAndIsActiveTrueOrderByOrderIndexAsc(questionIds);
        java.util.Map<Long, List<Answer>> answersByQuestionId = allAnswers.stream()
                .collect(Collectors.groupingBy(a -> a.getQuestion().getId()));

        return QuizDetailResponse.builder()
                .id(quiz.getId())
                .attemptId(attemptId)
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .imageUrl(quiz.getImageUrl())
                .questions(questions.stream()
                        .map(q -> mapToQuestionDto(q, answersByQuestionId.getOrDefault(q.getId(), List.of())))
                        .collect(Collectors.toList()))
                .build();
    }

    private QuestionDto mapToQuestionDto(Question question, List<Answer> answers) {
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
