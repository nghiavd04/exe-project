package com.product.exe.backend.dto.response;

import com.product.exe.backend.enums.ArticleCategory;
import com.product.exe.backend.enums.ArticleStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminArticleResponse {
    private Long id;
    private String title;
    private String slug;
    private ArticleCategory category;
    private ArticleStatus status;
    private Long viewCount;
    private String authorName; // Tên của Admin viết bài
    private Boolean isPremium;
    private LocalDateTime createdAt;
    private LocalDateTime publishedAt;
}
