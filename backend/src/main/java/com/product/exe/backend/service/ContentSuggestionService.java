package com.product.exe.backend.service;

import com.product.exe.backend.dto.response.SuggestionItem;

import java.util.List;

/**
 * Service tìm kiếm nội dung (bài viết, bài kiểm tra) liên quan đến câu hỏi của người dùng
 * để cung cấp cho AI như một context gợi ý.
 */
public interface ContentSuggestionService {

    /**
     * Tìm danh sách bài viết và bài kiểm tra liên quan đến nội dung câu hỏi.
     *
     * @param userMessage Tin nhắn của người dùng
     * @param maxItems Số lượng gợi ý tối đa cần trả về
     * @return Danh sách SuggestionItem (Articles + Quizzes)
     */
    List<SuggestionItem> findSuggestions(String userMessage, int maxItems);

    /**
     * Format danh sách suggestions thành chuỗi context hint để nhúng vào system prompt Gemini.
     *
     * @param suggestions Danh sách SuggestionItem
     * @return Chuỗi mô tả nội dung liên quan
     */
    String formatContextHint(List<SuggestionItem> suggestions);
}
