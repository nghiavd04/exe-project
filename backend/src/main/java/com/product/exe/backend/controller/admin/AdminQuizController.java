package com.product.exe.backend.controller.admin;

import com.product.exe.backend.dto.response.AdminQuizResponse;
import com.product.exe.backend.dto.response.AdminQuizStatsResponse;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.enums.QuizStatus;
import com.product.exe.backend.service.AdminQuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/quizzes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuizController {

    private final AdminQuizService adminQuizService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminQuizResponse>>> getQuizzes(
            @RequestParam(required = false) QuizStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminQuizService.getQuizzesForAdmin(status, search, pageable)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminQuizStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminQuizService.getQuizStats()));
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<String>> publishQuiz(@PathVariable Long id) {
        adminQuizService.publishQuiz(id);
        return ResponseEntity.ok(ApiResponse.success("Quiz published successfully"));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<String>> archiveQuiz(@PathVariable Long id) {
        adminQuizService.archiveQuiz(id);
        return ResponseEntity.ok(ApiResponse.success("Quiz archived successfully"));
    }

    @PatchMapping("/{id}/unarchive")
    public ResponseEntity<ApiResponse<String>> unarchiveQuiz(@PathVariable Long id) {
        adminQuizService.unarchiveQuiz(id);
        return ResponseEntity.ok(ApiResponse.success("Quiz unarchived successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteQuiz(@PathVariable Long id) {
        adminQuizService.deleteQuiz(id);
        return ResponseEntity.ok(ApiResponse.success("Quiz deleted successfully"));
    }
}
