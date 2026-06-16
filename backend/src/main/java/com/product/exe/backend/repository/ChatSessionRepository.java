package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ChatSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.repository.query.Param;
import com.product.exe.backend.enums.ChatSessionType;
import java.util.Optional;
import java.time.LocalDateTime;


@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    Page<ChatSession> findAllByUserIdOrderByUpdatedAtDesc(Long userId, Pageable pageable);
    
    Page<ChatSession> findAllByUserIdAndSessionTypeOrderByUpdatedAtDesc(Long userId, ChatSessionType sessionType, Pageable pageable);

    Optional<ChatSession> findFirstByUserIdAndSessionType(Long userId, ChatSessionType sessionType);

    @Modifying
    @Transactional
    @Query("DELETE FROM ChatSession s WHERE s.user.id = :userId AND s.sessionType = com.product.exe.backend.enums.ChatSessionType.AI AND NOT EXISTS (SELECT m FROM ChatMessage m WHERE m.session = s)")
    void deleteEmptySessionsByUserId(Long userId);

    Page<ChatSession> findAllByUserEmailContainingOrTitleContaining(String email, String title, Pageable pageable);

    Page<ChatSession> findAllBySessionType(ChatSessionType sessionType, Pageable pageable);

    @Query("SELECT s FROM ChatSession s WHERE s.sessionType = :sessionType AND (s.user.email LIKE %:search% OR s.title LIKE %:search%)")
    Page<ChatSession> findAllBySessionTypeAndSearch(
        @Param("sessionType") ChatSessionType sessionType,
        @Param("search") String search,
        Pageable pageable
    );

    long countByCreatedAtAfter(LocalDateTime date);
}
