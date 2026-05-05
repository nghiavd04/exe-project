package com.product.exe.backend.controller.admin;

import com.product.exe.backend.dto.request.QuizCreateRequest;
import com.product.exe.backend.dto.response.*;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.enums.QuizStatus;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.service.AdminQuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/quizzes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuizController {

    private final AdminQuizService adminQuizService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminQuizResponse>>> getQuizzes(
            @RequestParam(required = false) QuizStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminQuizService.getQuizzesForAdmin(status, search, pageable)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminQuizStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminQuizService.getQuizStats()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminQuizDetailResponse>> getQuizDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminQuizService.getQuizDetail(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<String>> createQuiz(@Valid @RequestBody QuizCreateRequest request) {
        Long userId = getCurrentUserId();
        adminQuizService.createQuiz(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Quiz created successfully as DRAFT"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> updateQuiz(@PathVariable Long id, @Valid @RequestBody QuizCreateRequest request) {
        adminQuizService.updateQuiz(id, request);
        return ResponseEntity.ok(ApiResponse.success("Quiz updated successfully"));
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

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElse(null);
    }
}

