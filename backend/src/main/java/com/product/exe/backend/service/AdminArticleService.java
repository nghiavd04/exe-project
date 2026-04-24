package com.product.exe.backend.service;

import com.product.exe.backend.dto.request.ArticleCreateRequest;
import com.product.exe.backend.dto.response.AdminArticleDetailResponse;
import com.product.exe.backend.dto.response.AdminArticleResponse;
import com.product.exe.backend.dto.response.AdminArticleStatsResponse;
import com.product.exe.backend.enums.ArticleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminArticleService {
    Page<AdminArticleResponse> getArticlesForAdmin(ArticleStatus status, String search, Pageable pageable);
    AdminArticleStatsResponse getArticleStats();
    AdminArticleDetailResponse getArticleDetail(Long id);
    void createArticle(ArticleCreateRequest request, Long userId);
    void updateArticle(Long id, ArticleCreateRequest request);
    void publishArticle(Long id);
    void archiveArticle(Long id);
    void unarchiveArticle(Long id);
    void deleteArticle(Long id);
}
