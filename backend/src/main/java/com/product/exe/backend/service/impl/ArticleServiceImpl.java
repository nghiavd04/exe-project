package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.response.ArticleDetailResponse;
import com.product.exe.backend.dto.response.ArticleSummaryResponse;
import com.product.exe.backend.entity.Article;
import com.product.exe.backend.enums.ArticleCategory;
import com.product.exe.backend.enums.ArticleStatus;
import com.product.exe.backend.enums.SubscriptionTier;
import com.product.exe.backend.exception.ResourceNotFoundException;
import com.product.exe.backend.exception.SubscriptionRequiredException;
import com.product.exe.backend.repository.ArticleRepository;
import com.product.exe.backend.service.ArticleService;
import com.product.exe.backend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepository;
    private final SubscriptionService subscriptionService;

    @Override
    public Page<ArticleSummaryResponse> getArticles(ArticleCategory category, String search, Pageable pageable) {
        String searchParam = (search != null && !search.isEmpty()) ? "%" + search.toLowerCase() + "%" : null;
        Page<Article> articles = articleRepository.findAllByStatusAndCategoryAndSearch(
                ArticleStatus.PUBLISHED, category, searchParam, pageable);
        
        return articles.map(this::mapToSummary);
    }

    @Override
    @Transactional
    public ArticleDetailResponse getArticleDetail(String slug, Long currentUserId) {
        Article article = articleRepository.findBySlugAndStatus(slug, ArticleStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với slug: " + slug));

        // Articles are free completely now, paid features are for future development.
        /*
        SubscriptionTier userTier = subscriptionService.getUserHighestTier(currentUserId);
        if (userTier.getWeight() < article.getRequiredTier().getWeight()) {
            throw new SubscriptionRequiredException("Bài viết này yêu cầu gói dịch vụ " + article.getRequiredTier().getDisplayName() + ".");
        }
        */

        return mapToDetail(article);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void incrementViewCount(Long articleId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với mã id: " + articleId));
        
        Long currentViews = article.getViewCount();
        article.setViewCount(currentViews == null ? 1L : currentViews + 1);
        articleRepository.save(article);
    }

    private ArticleSummaryResponse mapToSummary(Article article) {
        return ArticleSummaryResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .thumbnailUrl(article.getThumbnailUrl())
                .category(article.getCategory())
                .categoryDisplayName(article.getCategory() != null ? article.getCategory().getDisplayName() : null)
                .requiredTier(article.getRequiredTier())
                .requiredTierDisplayName(article.getRequiredTier() != null ? article.getRequiredTier().getDisplayName() : null)
                .publishedAt(article.getPublishedAt())
                .build();
    }

    private ArticleDetailResponse mapToDetail(Article article) {
        return ArticleDetailResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .content(article.getContent())
                .thumbnailUrl(article.getThumbnailUrl())
                .category(article.getCategory())
                .categoryDisplayName(article.getCategory() != null ? article.getCategory().getDisplayName() : null)
                .requiredTier(article.getRequiredTier())
                .requiredTierDisplayName(article.getRequiredTier() != null ? article.getRequiredTier().getDisplayName() : null)
                .publishedAt(article.getPublishedAt())
                .authorName(article.getAdmin() != null ? article.getAdmin().getFullName() : "Admin")
                .build();
    }
}
