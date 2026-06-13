package com.product.exe.backend.service;

import com.product.exe.backend.dto.response.AiChatResponseDto;
import com.product.exe.backend.entity.ChatMessage;
import com.product.exe.backend.entity.ChatSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

import com.product.exe.backend.enums.ChatSessionType;

public interface AiChatService {
    Page<ChatSession> getSessions(Long userId, ChatSessionType sessionType, Pageable pageable);
    ChatSession createSession(Long userId, String title, ChatSessionType sessionType);
    List<ChatMessage> getMessages(Long userId, Long sessionId, Integer limit);
    AiChatResponseDto sendMessage(Long userId, Long sessionId, String content);
    void deleteSession(Long userId, Long sessionId);
}
