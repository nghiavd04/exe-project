package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestionItem {

    /**
     * Loại nội dung: "ARTICLE" hoặc "QUIZ"
     */
    private String type;

    private Long id;

    private String title;

    /**
     * Slug dùng để tạo URL bài viết (chỉ dành cho ARTICLE)
     */
    private String slug;

    /**
     * URL ảnh thumbnail (nếu có)
     */
    private String thumbnailUrl;
}
