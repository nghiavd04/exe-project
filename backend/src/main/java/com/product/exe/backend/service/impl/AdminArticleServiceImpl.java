package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.response.AdminArticleResponse;
import com.product.exe.backend.dto.response.AdminArticleStatsResponse;
import com.product.exe.backend.entity.Article;
import com.product.exe.backend.enums.ArticleStatus;
import com.product.exe.backend.exception.ResourceNotFoundException;
import com.product.exe.backend.repository.ArticleRepository;
import com.product.exe.backend.service.AdminArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminArticleServiceImpl implements AdminArticleService {

    private final ArticleRepository articleRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminArticleResponse> getArticlesForAdmin(ArticleStatus status, String search, Pageable pageable) {
        return articleRepository.findAllForAdmin(status, search, pageable)
                .map(this::mapToAdminResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminArticleStatsResponse getArticleStats() {
        Long totalArticles = articleRepository.count();
        Long totalViews = articleRepository.sumViewCount();
        if (totalViews == null) totalViews = 0L;

        return AdminArticleStatsResponse.builder()
                .totalArticles(totalArticles)
                .viewsThisMonth(totalViews)
                .build();
    }

    @Override
    @Transactional
    public void publishArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
        if (article.getStatus() != ArticleStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT articles can be published");
        }
        article.setStatus(ArticleStatus.PUBLISHED);
        article.setPublishedAt(LocalDateTime.now());
        articleRepository.save(article);
    }

    @Override
    @Transactional
    public void archiveArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
        if (article.getStatus() != ArticleStatus.PUBLISHED) {
            throw new IllegalStateException("Only PUBLISHED articles can be archived");
        }
        article.setStatus(ArticleStatus.ARCHIVED);
        articleRepository.save(article);
    }

    @Override
    @Transactional
    public void unarchiveArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
        if (article.getStatus() != ArticleStatus.ARCHIVED) {
            throw new IllegalStateException("Only ARCHIVED articles can be unarchived");
        }
        article.setStatus(ArticleStatus.PUBLISHED);
        articleRepository.save(article);
    }

    @Override
    @Transactional
    public void deleteArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
        if (article.getStatus() != ArticleStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT articles can be deleted. Please archive others instead.");
        }
        articleRepository.delete(article);
    }

    private AdminArticleResponse mapToAdminResponse(Article article) {
        String authorName = "System";
        try {
            if (article.getAdmin() != null) {
                authorName = article.getAdmin().getFullName();
            }
        } catch (Exception e) {
            // Trường hợp lỗi Lazy Loading hoặc Proxy
            authorName = "Admin";
        }

        return AdminArticleResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .category(article.getCategory())
                .status(article.getStatus())
                .viewCount(article.getViewCount() != null ? article.getViewCount() : 0L)
                .authorName(authorName)
                .isPremium(article.getPremium())
                .createdAt(article.getCreatedAt())
                .publishedAt(article.getPublishedAt())
                .build();
    }
}
