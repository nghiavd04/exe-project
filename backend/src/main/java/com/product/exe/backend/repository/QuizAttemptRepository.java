package com.product.exe.backend.repository;

import com.product.exe.backend.entity.QuizAttempt;
import com.product.exe.backend.enums.QuizAttemptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    
    @Query("SELECT qa FROM QuizAttempt qa " +
           "JOIN qa.customer c " +
           "JOIN c.user u " +
           "WHERE u.id = :userId " +
           "ORDER BY qa.startedAt DESC")
    List<QuizAttempt> findAllByUserIdOrderByStartedAtDesc(@Param("userId") Long userId);
    Long countByStatus(QuizAttemptStatus status);
    Long countByStartedAtAfter(LocalDateTime date);

    @Query("SELECT qa.quiz.title, COUNT(qa) as attemptCount FROM QuizAttempt qa GROUP BY qa.quiz.title ORDER BY attemptCount DESC")
    Page<Object[]> findTopQuizzes(Pageable pageable);
}
