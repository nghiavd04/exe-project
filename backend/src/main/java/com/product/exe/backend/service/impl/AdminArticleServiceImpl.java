package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.request.ArticleCreateRequest;
import com.product.exe.backend.dto.response.AdminArticleDetailResponse;
import com.product.exe.backend.dto.response.AdminArticleResponse;
import com.product.exe.backend.dto.response.AdminArticleStatsResponse;
import com.product.exe.backend.entity.Admin;
import com.product.exe.backend.entity.Article;
import com.product.exe.backend.enums.ArticleStatus;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.exception.ResourceNotFoundException;
import com.product.exe.backend.repository.AdminRepository;
import com.product.exe.backend.repository.ArticleRepository;
import com.product.exe.backend.service.AdminArticleService;
import com.product.exe.backend.util.SlugUtil;
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
    private final AdminRepository adminRepository;

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
    @Transactional(readOnly = true)
    public AdminArticleDetailResponse getArticleDetail(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
        return mapToDetailResponse(article);
    }

    @Override
    @Transactional
    public void createArticle(ArticleCreateRequest request, Long userId) {
        Admin admin = adminRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        Article article = Article.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .thumbnailUrl(request.getThumbnailUrl())
                .thumbnailPublicId(request.getThumbnailPublicId())
                .premium(request.getPremium() != null ? request.getPremium() : false)
                .slug(SlugUtil.toSlug(request.getTitle()) + "-" + System.currentTimeMillis())
                .status(ArticleStatus.DRAFT)
                .admin(admin)
                .build();

        articleRepository.save(article);
    }

    @Override
    @Transactional
    public void updateArticle(Long id, ArticleCreateRequest request) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));

        if (article.getStatus() == ArticleStatus.PUBLISHED) {
            throw new BadRequestException("Cannot edit a published article. Please archive it first.");
        }

        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setCategory(request.getCategory());
        article.setThumbnailUrl(request.getThumbnailUrl());
        article.setThumbnailPublicId(request.getThumbnailPublicId());
        article.setPremium(request.getPremium() != null ? request.getPremium() : false);
        
        // Optionally update slug if title changes significantly
        // article.setSlug(SlugUtil.toSlug(request.getTitle()) + "-" + article.getId());

        articleRepository.save(article);
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

    private AdminArticleDetailResponse mapToDetailResponse(Article article) {
        String authorName = "System";
        if (article.getAdmin() != null) {
            authorName = article.getAdmin().getFullName();
        }

        return AdminArticleDetailResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .content(article.getContent())
                .category(article.getCategory())
                .status(article.getStatus())
                .thumbnailUrl(article.getThumbnailUrl())
                .thumbnailPublicId(article.getThumbnailPublicId())
                .isPremium(article.getPremium())
                .viewCount(article.getViewCount() != null ? article.getViewCount() : 0L)
                .authorName(authorName)
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .publishedAt(article.getPublishedAt())
                .build();
    }
}
