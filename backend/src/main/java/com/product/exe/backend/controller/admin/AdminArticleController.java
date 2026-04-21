package com.product.exe.backend.controller.admin;

import com.product.exe.backend.dto.response.AdminArticleResponse;
import com.product.exe.backend.dto.response.AdminArticleStatsResponse;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.enums.ArticleStatus;
import com.product.exe.backend.service.AdminArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/articles")
@RequiredArgsConstructor
public class AdminArticleController {

    private final AdminArticleService adminArticleService;

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
}
