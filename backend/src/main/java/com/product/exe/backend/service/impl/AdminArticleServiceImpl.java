package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.request.ArticleCreateRequest;
import com.product.exe.backend.dto.response.AdminArticleDetailResponse;
import com.product.exe.backend.dto.response.AdminArticleResponse;
import com.product.exe.backend.dto.response.AdminArticleStatsResponse;
import com.product.exe.backend.entity.Admin;
import com.product.exe.backend.entity.Article;
import com.product.exe.backend.enums.ArticleStatus;
import com.product.exe.backend.enums.SubscriptionTier;
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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết"));
        return mapToDetailResponse(article);
    }

    @Override
    @Transactional
    public void createArticle(ArticleCreateRequest request, Long userId) {
        Admin admin = adminRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản quản trị viên"));

        Article article = Article.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .thumbnailUrl(request.getThumbnailUrl())
                .thumbnailPublicId(request.getThumbnailPublicId())
                .sourceUrl(request.getSourceUrl())
                .requiredTier(SubscriptionTier.FREE)
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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết"));

        if (article.getStatus() == ArticleStatus.PUBLISHED) {
            throw new BadRequestException("Không thể chỉnh sửa bài viết đã xuất bản. Vui lòng lưu trữ trước.");
        }

        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setCategory(request.getCategory());
        article.setThumbnailUrl(request.getThumbnailUrl());
        article.setThumbnailPublicId(request.getThumbnailPublicId());
        article.setSourceUrl(request.getSourceUrl());
        article.setRequiredTier(SubscriptionTier.FREE);
        
        // Optionally update slug if title changes significantly
        // article.setSlug(SlugUtil.toSlug(request.getTitle()) + "-" + article.getId());

        articleRepository.save(article);
    }

    @Override
    @Transactional
    public void publishArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết"));
        if (article.getStatus() != ArticleStatus.DRAFT) {
            throw new IllegalStateException("Chỉ những bài viết nháp (DRAFT) mới có thể được xuất bản");
        }
        article.setStatus(ArticleStatus.PUBLISHED);
        article.setPublishedAt(LocalDateTime.now());
        articleRepository.save(article);
    }

    @Override
    @Transactional
    public void archiveArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết"));
        if (article.getStatus() != ArticleStatus.PUBLISHED) {
            throw new IllegalStateException("Chỉ những bài viết đã xuất bản (PUBLISHED) mới có thể được lưu trữ");
        }
        article.setStatus(ArticleStatus.ARCHIVED);
        articleRepository.save(article);
    }

    @Override
    @Transactional
    public void unarchiveArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết"));
        if (article.getStatus() != ArticleStatus.ARCHIVED) {
            throw new IllegalStateException("Chỉ những bài viết đã lưu trữ (ARCHIVED) mới có thể hủy lưu trữ");
        }
        article.setStatus(ArticleStatus.PUBLISHED);
        articleRepository.save(article);
    }

    @Override
    @Transactional
    public void deleteArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết"));
        if (article.getStatus() != ArticleStatus.DRAFT) {
            throw new IllegalStateException("Chỉ những bài viết nháp (DRAFT) mới có thể bị xóa. Vui lòng lưu trữ các bài khác thay thế.");
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
                .categoryDisplayName(article.getCategory() != null ? article.getCategory().getDisplayName() : null)
                .sourceUrl(article.getSourceUrl())
                .status(article.getStatus())
                .statusDisplayName(article.getStatus() != null ? article.getStatus().getDisplayName() : null)
                .viewCount(article.getViewCount() != null ? article.getViewCount() : 0L)
                .authorName(authorName)
                .requiredTier(article.getRequiredTier())
                .requiredTierDisplayName(article.getRequiredTier() != null ? article.getRequiredTier().getDisplayName() : null)
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
                .categoryDisplayName(article.getCategory() != null ? article.getCategory().getDisplayName() : null)
                .sourceUrl(article.getSourceUrl())
                .status(article.getStatus())
                .statusDisplayName(article.getStatus() != null ? article.getStatus().getDisplayName() : null)
                .thumbnailUrl(article.getThumbnailUrl())
                .thumbnailPublicId(article.getThumbnailPublicId())
                .requiredTier(article.getRequiredTier())
                .requiredTierDisplayName(article.getRequiredTier() != null ? article.getRequiredTier().getDisplayName() : null)
                .viewCount(article.getViewCount() != null ? article.getViewCount() : 0L)
                .authorName(authorName)
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .publishedAt(article.getPublishedAt())
                .build();
    }
}
