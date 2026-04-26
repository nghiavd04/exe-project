package com.product.exe.backend.dto.response;

import com.product.exe.backend.enums.ArticleCategory;
import com.product.exe.backend.enums.ArticleStatus;
import com.product.exe.backend.enums.SubscriptionTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminArticleDetailResponse {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private ArticleCategory category;
    private ArticleStatus status;
    private String thumbnailUrl;
    private String thumbnailPublicId;
    private SubscriptionTier requiredTier;
    private Long viewCount;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
}
