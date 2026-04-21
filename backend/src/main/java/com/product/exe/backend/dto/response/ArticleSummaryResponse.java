package com.product.exe.backend.dto.response;

import com.product.exe.backend.enums.ArticleCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleSummaryResponse {
    private Long id;
    private String title;
    private String slug;
    private String thumbnailUrl;
    private ArticleCategory category;
    private Boolean isPremium;
    private LocalDateTime publishedAt;
}
