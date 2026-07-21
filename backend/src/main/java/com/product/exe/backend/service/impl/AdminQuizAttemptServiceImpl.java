package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.response.*;
import com.product.exe.backend.entity.*;
import com.product.exe.backend.enums.QuizAttemptStatus;
import com.product.exe.backend.exception.ResourceNotFoundException;
import com.product.exe.backend.repository.*;
import com.product.exe.backend.service.AdminQuizAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminQuizAttemptServiceImpl implements AdminQuizAttemptService {

    private final QuizAttemptRepository quizAttemptRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminQuizAttemptStatsResponse getStats() {
        long totalAttempts = quizAttemptRepository.count();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        long attemptsToday = quizAttemptRepository.countByStartedAtAfter(todayStart);
        long completedAttempts = quizAttemptRepository.countByStatus(QuizAttemptStatus.COMPLETED);
        long inProgressAttempts = quizAttemptRepository.countByStatus(QuizAttemptStatus.IN_PROGRESS);
        long abandonedAttempts = quizAttemptRepository.countByStatus(QuizAttemptStatus.EXPIRED);
        
        Long uniqueUsers = quizAttemptRepository.countUniqueUsers();
        if (uniqueUsers == null) {
            uniqueUsers = 0L;
        }

        Double avgScore = quizAttemptRepository.getAverageScore();
        if (avgScore == null) {
            avgScore = 0.0;
        }

        double completionRate = totalAttempts > 0 
                ? ((double) completedAttempts / totalAttempts) * 100.0 
                : 0.0;

        return AdminQuizAttemptStatsResponse.builder()
                .totalAttempts(totalAttempts)
                .attemptsToday(attemptsToday)
                .completedAttempts(completedAttempts)
                .inProgressAttempts(inProgressAttempts)
                .abandonedAttempts(abandonedAttempts)
                .uniqueUsers(uniqueUsers)
                .averageScore(avgScore)
                .completionRate(completionRate)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminQuizAttemptChartPoint> getChart(String period) {
        LocalDate now = LocalDate.now();
        int days = 7;
        if ("14d".equals(period)) {
            days = 14;
        } else if ("30d".equals(period)) {
            days = 30;
        } else if ("month".equals(period)) {
            days = now.getDayOfMonth();
        }

        LocalDateTime startDate = now.minusDays(days - 1).atStartOfDay();
        List<Object[]> rawData = quizAttemptRepository.countAttemptsByDateSinceNative(startDate);

        Map<String, Map<String, Long>> dateStatsMap = new HashMap<>();
        for (Object[] row : rawData) {
            String dateStr = String.valueOf(row[0]); // yyyy-MM-dd
            long total = ((Number) row[1]).longValue();
            long completed = ((Number) row[2]).longValue();
            long abandoned = ((Number) row[3]).longValue();

            try {
                LocalDate date = LocalDate.parse(dateStr);
                String label = date.format(DateTimeFormatter.ofPattern("dd/MM"));
                Map<String, Long> stats = new HashMap<>();
                stats.put("total", total);
                stats.put("completed", completed);
                stats.put("abandoned", abandoned);
                dateStatsMap.put(label, stats);
            } catch (Exception ignored) {}
        }

        List<AdminQuizAttemptChartPoint> chartPoints = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = now.minusDays(i);
            String label = date.format(formatter);
            Map<String, Long> stats = dateStatsMap.getOrDefault(label, Collections.emptyMap());

            chartPoints.add(AdminQuizAttemptChartPoint.builder()
                    .label(label)
                    .totalAttempts(stats.getOrDefault("total", 0L))
                    .completedAttempts(stats.getOrDefault("completed", 0L))
                    .abandonedAttempts(stats.getOrDefault("abandoned", 0L))
                    .build());
        }

        return chartPoints;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminQuizPerformanceResponse> getPerformanceByQuiz() {
        List<Object[]> rawData = quizAttemptRepository.getQuizPerformanceNative();
        List<AdminQuizPerformanceResponse> responseList = new ArrayList<>();

        for (Object[] row : rawData) {
            Long quizId = ((Number) row[0]).longValue();
            String quizTitle = (String) row[1];
            long totalAttempts = ((Number) row[2]).longValue();
            long uniqueUsers = ((Number) row[3]).longValue();
            
            Double avgScore = row[4] != null ? ((Number) row[4]).doubleValue() : 0.0;
            long completedCount = ((Number) row[5]).longValue();

            LocalDateTime lastAttemptAt = null;
            Object dateObj = row[6];
            if (dateObj instanceof Timestamp) {
                lastAttemptAt = ((Timestamp) dateObj).toLocalDateTime();
            } else if (dateObj instanceof LocalDateTime) {
                lastAttemptAt = (LocalDateTime) dateObj;
            }

            double completionRate = totalAttempts > 0
                    ? ((double) completedCount / totalAttempts) * 100.0
                    : 0.0;

            responseList.add(AdminQuizPerformanceResponse.builder()
                    .quizId(quizId)
                    .quizTitle(quizTitle)
                    .totalAttempts(totalAttempts)
                    .uniqueUsers(uniqueUsers)
                    .averageScore(avgScore)
                    .completionRate(completionRate)
                    .lastAttemptAt(lastAttemptAt)
                    .build());
        }

        return responseList;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminQuizAttemptListResponse> getAttempts(
            Long quizId,
            QuizAttemptStatus status,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String keyword,
            Pageable pageable) {

        String trimmedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        Page<QuizAttempt> attemptsPage = quizAttemptRepository.findAllForAdmin(
                quizId, status, fromDate, toDate, trimmedKeyword, pageable);

        return attemptsPage.map(qa -> {
            Long durationSeconds = null;
            if (qa.getStartedAt() != null && qa.getSubmittedAt() != null) {
                durationSeconds = Duration.between(qa.getStartedAt(), qa.getSubmittedAt()).getSeconds();
            }

            Customer c = qa.getCustomer();
            String customerName = "Unknown";
            String customerEmail = "Unknown";
            if (c != null) {
                customerName = c.getFullName();
                if (c.getUser() != null) {
                    customerEmail = c.getUser().getEmail();
                }
            }

            return AdminQuizAttemptListResponse.builder()
                    .id(qa.getId())
                    .customerId(c != null ? c.getId() : null)
                    .customerName(customerName)
                    .customerEmail(customerEmail)
                    .quizId(qa.getQuiz().getId())
                    .quizTitle(qa.getQuiz().getTitle())
                    .status(qa.getStatus().name())
                    .startedAt(qa.getStartedAt())
                    .submittedAt(qa.getSubmittedAt())
                    .totalScore(qa.getTotalScore())
                    .assessmentResult(qa.getAssessmentResult())
                    .durationSeconds(durationSeconds)
                    .build();
        });
    }

    @Override
    @Transactional(readOnly = true)
    public AdminQuizAttemptDetailResponse getAttemptDetail(Long id) {
        QuizAttempt qa = quizAttemptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt làm bài trắc nghiệm với ID: " + id));

        Customer c = qa.getCustomer();
        String customerName = "Unknown";
        String customerEmail = "Unknown";
        String avatarUrl = null;
        if (c != null) {
            customerName = c.getFullName();
            avatarUrl = c.getAvatarUrl();
            if (c.getUser() != null) {
                customerEmail = c.getUser().getEmail();
            }
        }

        // Fetch all questions for this quiz
        List<Question> questions = questionRepository.findAllByQuizIdAndIsActiveTrueOrderByOrderIndexAsc(qa.getQuiz().getId());
        List<Long> questionIds = questions.stream().map(Question::getId).collect(Collectors.toList());

        // Fetch all options
        List<Answer> allAnswers = answerRepository.findAllByQuestionIdInAndIsActiveTrueOrderByOrderIndexAsc(questionIds);
        Map<Long, List<Answer>> answersByQuestionId = allAnswers.stream()
                .collect(Collectors.groupingBy(a -> a.getQuestion().getId()));

        // Fetch user selected answers
        List<UserAnswer> userAnswers = userAnswerRepository.findAllByAttemptId(id);
        Map<Long, List<Long>> selectedAnswerIdsByQuestionId = userAnswers.stream()
                .filter(ua -> ua.getAnswer() != null)
                .collect(Collectors.groupingBy(
                        ua -> ua.getQuestion().getId(),
                        Collectors.mapping(ua -> ua.getAnswer().getId(), Collectors.toList())
                ));

        List<AdminQuizAttemptDetailResponse.QuestionDetail> questionDetails = questions.stream().map(q -> {
            List<Answer> options = answersByQuestionId.getOrDefault(q.getId(), Collections.emptyList());
            List<Long> selectedIds = selectedAnswerIdsByQuestionId.getOrDefault(q.getId(), Collections.emptyList());

            List<AdminQuizAttemptDetailResponse.AnswerOption> optionDtos = options.stream()
                    .map(o -> AdminQuizAttemptDetailResponse.AnswerOption.builder()
                            .id(o.getId())
                            .content(o.getContent())
                            .value(o.getValue())
                            .build())
                    .collect(Collectors.toList());

            return AdminQuizAttemptDetailResponse.QuestionDetail.builder()
                    .questionId(q.getId())
                    .content(q.getContent())
                    .type(q.getType().name())
                    .selectedAnswerIds(selectedIds)
                    .options(optionDtos)
                    .build();
        }).collect(Collectors.toList());

        return AdminQuizAttemptDetailResponse.builder()
                .id(qa.getId())
                .customerId(c != null ? c.getId() : null)
                .customerName(customerName)
                .customerEmail(customerEmail)
                .avatarUrl(avatarUrl)
                .quizId(qa.getQuiz().getId())
                .quizTitle(qa.getQuiz().getTitle())
                .quizDescription(qa.getQuiz().getDescription())
                .status(qa.getStatus().name())
                .startedAt(qa.getStartedAt())
                .submittedAt(qa.getSubmittedAt())
                .totalScore(qa.getTotalScore())
                .assessmentResult(qa.getAssessmentResult())
                .questions(questionDetails)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminAssessmentBreakdownResponse> getAssessmentBreakdown(Long quizId) {
        List<Object[]> rawData = quizAttemptRepository.getAssessmentBreakdown(quizId);
        List<AdminAssessmentBreakdownResponse> breakdownList = new ArrayList<>();

        for (Object[] row : rawData) {
            String resultText = (String) row[0];
            long count = ((Number) row[1]).longValue();

            breakdownList.add(AdminAssessmentBreakdownResponse.builder()
                    .resultText(resultText)
                    .count(count)
                    .build());
        }

        return breakdownList;
    }
}
