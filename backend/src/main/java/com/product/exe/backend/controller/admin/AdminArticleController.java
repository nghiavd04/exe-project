package com.product.exe.backend.controller.admin;

import com.product.exe.backend.dto.request.ArticleCreateRequest;
import com.product.exe.backend.dto.response.*;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.enums.ArticleStatus;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.service.AdminArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/articles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminArticleController {

    private final AdminArticleService adminArticleService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminArticleResponse>>> getArticles(
            @RequestParam(required = false) ArticleStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminArticleService.getArticlesForAdmin(status, search, pageable)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminArticleStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminArticleService.getArticleStats()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminArticleDetailResponse>> getArticleDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminArticleService.getArticleDetail(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<String>> createArticle(@Valid @RequestBody ArticleCreateRequest request) {
        Long userId = getCurrentUserId();
        adminArticleService.createArticle(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Article created successfully as DRAFT"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> updateArticle(@PathVariable Long id, @Valid @RequestBody ArticleCreateRequest request) {
        adminArticleService.updateArticle(id, request);
        return ResponseEntity.ok(ApiResponse.success("Article updated successfully"));
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<String>> publishArticle(@PathVariable Long id) {
        adminArticleService.publishArticle(id);
        return ResponseEntity.ok(ApiResponse.success("Article published successfully"));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<String>> archiveArticle(@PathVariable Long id) {
        adminArticleService.archiveArticle(id);
        return ResponseEntity.ok(ApiResponse.success("Article archived successfully"));
    }

    @PatchMapping("/{id}/unarchive")
    public ResponseEntity<ApiResponse<String>> unarchiveArticle(@PathVariable Long id) {
        adminArticleService.unarchiveArticle(id);
        return ResponseEntity.ok(ApiResponse.success("Article unarchived successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteArticle(@PathVariable Long id) {
        adminArticleService.deleteArticle(id);
        return ResponseEntity.ok(ApiResponse.success("Article deleted successfully"));
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
