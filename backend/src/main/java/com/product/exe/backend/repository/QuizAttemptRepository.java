package com.product.exe.backend.repository;

import com.product.exe.backend.entity.QuizAttempt;
import com.product.exe.backend.enums.QuizAttemptStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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

    @Query("SELECT COUNT(DISTINCT qa.customer.id) FROM QuizAttempt qa")
    Long countUniqueUsers();

    @Query("SELECT AVG(qa.totalScore) FROM QuizAttempt qa WHERE qa.status = 'COMPLETED'")
    Double getAverageScore();

    @Query(value = "SELECT DATE(started_at) as date, " +
           "COUNT(*) as total, " +
           "SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed, " +
           "SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) as abandoned " +
           "FROM quiz_attempts " +
           "WHERE started_at >= :startDate " +
           "GROUP BY DATE(started_at) " +
           "ORDER BY DATE(started_at)", nativeQuery = true)
    List<Object[]> countAttemptsByDateSinceNative(@Param("startDate") LocalDateTime startDate);

    @Query(value = "SELECT q.id, q.title, " +
           "COUNT(qa.id) as totalAttempts, " +
           "COUNT(DISTINCT qa.customer_id) as uniqueUsers, " +
           "AVG(CASE WHEN qa.status = 'COMPLETED' THEN qa.total_score ELSE NULL END) as avgScore, " +
           "SUM(CASE WHEN qa.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount, " +
           "MAX(qa.started_at) as lastAttemptAt " +
           "FROM quizzes q " +
           "LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id " +
           "WHERE q.is_active = true " +
           "GROUP BY q.id, q.title", nativeQuery = true)
    List<Object[]> getQuizPerformanceNative();

    @Query(value = "SELECT qa FROM QuizAttempt qa " +
           "WHERE (:quizId IS NULL OR qa.quiz.id = :quizId) " +
           "AND (:status IS NULL OR qa.status = :status) " +
           "AND (:fromDate IS NULL OR qa.startedAt >= :fromDate) " +
           "AND (:toDate IS NULL OR qa.startedAt <= :toDate) " +
           "AND (:keyword IS NULL OR (LOWER(qa.customer.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(qa.customer.user.email) LIKE LOWER(CONCAT('%', :keyword, '%'))))",
           countQuery = "SELECT COUNT(qa) FROM QuizAttempt qa " +
           "WHERE (:quizId IS NULL OR qa.quiz.id = :quizId) " +
           "AND (:status IS NULL OR qa.status = :status) " +
           "AND (:fromDate IS NULL OR qa.startedAt >= :fromDate) " +
           "AND (:toDate IS NULL OR qa.startedAt <= :toDate) " +
           "AND (:keyword IS NULL OR (LOWER(qa.customer.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(qa.customer.user.email) LIKE LOWER(CONCAT('%', :keyword, '%'))))")
    Page<QuizAttempt> findAllForAdmin(
            @Param("quizId") Long quizId,
            @Param("status") QuizAttemptStatus status,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query("SELECT qa.assessmentResult, COUNT(qa) FROM QuizAttempt qa " +
           "WHERE (:quizId IS NULL OR qa.quiz.id = :quizId) AND qa.status = 'COMPLETED' AND qa.assessmentResult IS NOT NULL " +
           "GROUP BY qa.assessmentResult")
    List<Object[]> getAssessmentBreakdown(@Param("quizId") Long quizId);
}
