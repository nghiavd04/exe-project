package com.product.exe.backend.service;

import com.product.exe.backend.dto.response.ArticleDetailResponse;
import com.product.exe.backend.dto.response.ArticleSummaryResponse;
import com.product.exe.backend.enums.ArticleCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ArticleService {
    Page<ArticleSummaryResponse> getArticles(ArticleCategory category, String search, Pageable pageable);
    ArticleDetailResponse getArticleDetail(String slug, Long currentUserId);

    void incrementViewCount(Long articleId);
}
