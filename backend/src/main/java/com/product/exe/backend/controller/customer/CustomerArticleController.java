package com.product.exe.backend.controller.customer;

import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.dto.response.ArticleDetailResponse;
import com.product.exe.backend.dto.response.ArticleSummaryResponse;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.enums.ArticleCategory;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customer/articles")
@RequiredArgsConstructor
public class CustomerArticleController {

    private final ArticleService articleService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ArticleSummaryResponse>>> getArticles(
            @RequestParam(required = false) ArticleCategory category,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 9) Pageable pageable) {
        try {
            Page<ArticleSummaryResponse> articles = articleService.getArticles(category, search, pageable);
            return ResponseEntity.ok(ApiResponse.success(articles));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Internal Server Error: " + e.getMessage()));
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<ArticleCategory[]>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(ArticleCategory.values()));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<ArticleDetailResponse>> getArticleDetail(@PathVariable String slug) {
        try {
            Long userId = getCurrentUserId();
            ArticleDetailResponse article = articleService.getArticleDetail(slug, userId);
            return ResponseEntity.ok(ApiResponse.success(article));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Error fetching article: " + e.getMessage()));
        }
    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<String>> incrementViewCount(@PathVariable Long id) {
        try {
            articleService.incrementViewCount(id);
            return ResponseEntity.ok(ApiResponse.success("View count incremented"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Error incrementing view count: " + e.getMessage()));
        }
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
