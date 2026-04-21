package com.product.exe.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminArticleStatsResponse {
    private Long totalArticles;
    private Long viewsThisMonth;
}
