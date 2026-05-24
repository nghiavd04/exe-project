package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ContactMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    @Query(value = "SELECT cm FROM ContactMessage cm " +
            "LEFT JOIN FETCH cm.repliedBy rb " +
            "LEFT JOIN FETCH rb.admin " +
            "WHERE (:search IS NULL OR cm.name LIKE %:search% OR cm.email LIKE %:search% OR cm.message LIKE %:search%) " +
            "AND (:isRead IS NULL OR cm.isRead = :isRead) " +
            "AND (:isReplied IS NULL OR (:isReplied = true AND cm.replyMessage IS NOT NULL) OR (:isReplied = false AND cm.replyMessage IS NULL))",
           countQuery = "SELECT count(cm) FROM ContactMessage cm " +
            "WHERE (:search IS NULL OR cm.name LIKE %:search% OR cm.email LIKE %:search% OR cm.message LIKE %:search%) " +
            "AND (:isRead IS NULL OR cm.isRead = :isRead) " +
            "AND (:isReplied IS NULL OR (:isReplied = true AND cm.replyMessage IS NOT NULL) OR (:isReplied = false AND cm.replyMessage IS NULL))")
    Page<ContactMessage> findAllWithFilter(
            @Param("search") String search,
            @Param("isRead") Boolean isRead,
            @Param("isReplied") Boolean isReplied,
            Pageable pageable);

    boolean existsByUserIdAndMessageAndCreatedAtAfter(Long userId, String message, LocalDateTime dateTime);

    long countByIsReadFalse();
}
