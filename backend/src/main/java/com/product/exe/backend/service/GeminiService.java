package com.product.exe.backend.service;

import com.product.exe.backend.entity.ChatMessage;
import java.util.List;

public interface GeminiService {
    String getChatResponse(List<ChatMessage> history, String userPrompt);
}
