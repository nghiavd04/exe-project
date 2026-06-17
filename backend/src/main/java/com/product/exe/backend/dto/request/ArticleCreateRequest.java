package com.product.exe.backend.dto.request;

import com.product.exe.backend.enums.ArticleCategory;
import com.product.exe.backend.enums.SubscriptionTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleCreateRequest {
    private String title;
    private String content;
    private ArticleCategory category;
    private String thumbnailUrl;
    private String thumbnailPublicId;
    private String sourceUrl;
}
