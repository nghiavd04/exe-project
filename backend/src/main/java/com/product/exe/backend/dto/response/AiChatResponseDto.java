package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO kết quả trả về sau khi gửi tin nhắn đến AI.
 * Bao gồm câu trả lời văn bản của AI và danh sách gợi ý nội dung liên quan.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatResponseDto {

    /**
     * Câu trả lời văn bản từ Gemini AI
     */
    private String aiText;

    /**
     * ID của ChatMessage AI đã lưu vào DB
     */
    private Long messageId;

    /**
     * Danh sách bài viết / bài kiểm tra được gợi ý liên quan đến câu hỏi của người dùng
     */
    private List<SuggestionItem> suggestions;
}
