package com.product.exe.backend.controller.admin;

import com.product.exe.backend.dto.response.*;
import com.product.exe.backend.enums.QuizAttemptStatus;
import com.product.exe.backend.service.AdminQuizAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/quiz-attempts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuizAttemptController {

    private final AdminQuizAttemptService adminQuizAttemptService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminQuizAttemptStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminQuizAttemptService.getStats()));
    }

    @GetMapping("/chart")
    public ResponseEntity<ApiResponse<List<AdminQuizAttemptChartPoint>>> getChart(
            @RequestParam(required = false, defaultValue = "7d") String period) {
        return ResponseEntity.ok(ApiResponse.success(adminQuizAttemptService.getChart(period)));
    }

    @GetMapping("/by-quiz")
    public ResponseEntity<ApiResponse<List<AdminQuizPerformanceResponse>>> getPerformanceByQuiz() {
        return ResponseEntity.ok(ApiResponse.success(adminQuizAttemptService.getPerformanceByQuiz()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminQuizAttemptListResponse>>> getAttempts(
            @RequestParam(required = false) Long quizId,
            @RequestParam(required = false) QuizAttemptStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "startedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                adminQuizAttemptService.getAttempts(quizId, status, fromDate, toDate, keyword, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminQuizAttemptDetailResponse>> getAttemptDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminQuizAttemptService.getAttemptDetail(id)));
    }

    @GetMapping("/assessment-breakdown")
    public ResponseEntity<ApiResponse<List<AdminAssessmentBreakdownResponse>>> getAssessmentBreakdown(
            @RequestParam(required = false) Long quizId) {
        return ResponseEntity.ok(ApiResponse.success(adminQuizAttemptService.getAssessmentBreakdown(quizId)));
    }
}
