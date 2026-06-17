package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findAllBySessionIdOrderByCreatedAtAsc(Long sessionId);
    List<ChatMessage> findAllBySessionId(Long sessionId,Pageable pageable);
    void deleteAllBySessionId(Long sessionId);

    // Unread count queries
    long countBySessionUserIdAndRoleNotAndIsReadFalse(Long userId, String role);

    long countByRoleAndIsReadFalse(String role);
    long countBySessionIdAndRoleAndIsReadFalse(Long sessionId, String role);

    @Query("SELECT COUNT(DISTINCT m.session) FROM ChatMessage m WHERE m.role = :role AND m.isRead = false AND m.session.sessionType = com.product.exe.backend.enums.ChatSessionType.SUPPORT")
    long countDistinctSessionByRoleAndIsReadFalse(@Param("role") String role);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.session.id IN (SELECT s.id FROM ChatSession s WHERE s.user.id = :userId) AND m.role <> 'user'")
    void markAllAsReadForUser(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.session.id = :sessionId AND m.role = :role")
    void markAllAsReadForSession(@Param("sessionId") Long sessionId, @Param("role") String role);
}
