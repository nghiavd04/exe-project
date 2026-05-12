package com.product.exe.backend.controller.customer;

import com.product.exe.backend.dto.request.SubmitAnswerRequest;
import com.product.exe.backend.dto.response.*;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/customer")
@RequiredArgsConstructor
public class CustomerQuizController {

    private final QuizService quizService;
    private final UserRepository userRepository;

    @GetMapping("/quizzes")
    public ResponseEntity<ApiResponse<Page<QuizSummaryResponse>>> getQuizzes(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 9, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            Page<QuizSummaryResponse> quizzes = quizService.getQuizzes(search, pageable);
            return ResponseEntity.ok(ApiResponse.success(quizzes));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Debug Error: " + e.getMessage()));
        }
    }

    @GetMapping("/quizzes/{id}")
    public ResponseEntity<ApiResponse<QuizDetailResponse>> getQuizDetail(@PathVariable Long id) {
        QuizDetailResponse quiz = quizService.getQuizDetail(id);
        return ResponseEntity.ok(ApiResponse.success(quiz));
    }

    @PostMapping("/quizzes/{id}/attempts")
    public ResponseEntity<ApiResponse<QuizDetailResponse>> startQuiz(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        QuizDetailResponse quiz = quizService.startQuiz(id, userId);
        return ResponseEntity.ok(ApiResponse.success(quiz));
    }

    @PostMapping("/attempts/{attemptId}/answers")
    public ResponseEntity<ApiResponse<Void>> submitAnswer(
            @PathVariable Long attemptId,
            @RequestBody SubmitAnswerRequest request) {
        Long userId = getCurrentUserId();
        quizService.submitAnswer(attemptId, request, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<ApiResponse<QuizResultResponse>> finishQuiz(@PathVariable Long attemptId) {
        Long userId = getCurrentUserId();
        QuizResultResponse result = quizService.finishQuiz(attemptId, userId);
        return ResponseEntity.ok(ApiResponse.success(result));
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
