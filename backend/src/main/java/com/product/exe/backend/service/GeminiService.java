package com.product.exe.backend.service;

import com.product.exe.backend.entity.ChatMessage;
import java.util.List;

public interface GeminiService {
    String getChatResponse(List<ChatMessage> history, String userPrompt);

    /**
     * Gọi Gemini với context bổ sung về nội dung gợi ý liên quan từ hệ thống.
     *
     * @param history     Lịch sử trò chuyện
     * @param userPrompt  Câu hỏi của người dùng
     * @param contextHint Chuỗi context bổ sung được nhúng vào system instruction
     * @return Câu trả lời văn bản từ Gemini
     */
    String getChatResponse(List<ChatMessage> history, String userPrompt, String contextHint);
}

