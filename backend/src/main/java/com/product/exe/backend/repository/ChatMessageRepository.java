package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findAllBySessionIdOrderByCreatedAtAsc(Long sessionId);
    List<ChatMessage> findAllBySessionId(Long sessionId,Pageable pageable);
    void deleteAllBySessionId(Long sessionId);
}
