package com.product.exe.backend.repository;

import com.product.exe.backend.entity.Quiz;
import com.product.exe.backend.enums.QuizStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Page<Quiz> findAllByStatus(QuizStatus status, Pageable pageable);
    
    @Query(value = "SELECT q.id, q.title, q.status, q.created_at as createdAt, COUNT(qa.id) as attemptCount " +
           "FROM quizzes q LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id " +
           "WHERE (:status IS NULL OR q.status = :status) " +
           "AND (:search IS NULL OR LOWER(q.title) LIKE :search) " +
           "GROUP BY q.id, q.title, q.status, q.created_at", 
           countQuery = "SELECT COUNT(q.id) FROM quizzes q " +
                        "WHERE (:status IS NULL OR q.status = :status) " +
                        "AND (:search IS NULL OR LOWER(q.title) LIKE :search)",
           nativeQuery = true)
    Page<Object[]> findAllForAdminRaw(
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT q FROM Quiz q " +
           "WHERE q.status = :status AND q.isActive = true " +
           "AND (:search IS NULL OR LOWER(q.title) LIKE :search OR LOWER(q.description) LIKE :search)")
    Page<Quiz> findAllByStatusAndSearch(
            @Param("status") QuizStatus status,
            @Param("search") String search,
            Pageable pageable);

    Long countByCreatedAtAfter(java.time.LocalDateTime date);

    Optional<Quiz> findByIdAndStatus(Long id, QuizStatus status);

    /**
     * Tìm tối đa N bài kiểm tra đã xuất bản có tiêu đề chứa từ khóa (dùng cho AI suggestion).
     */
    @Query("SELECT q FROM Quiz q " +
           "WHERE q.status = :status AND q.isActive = true " +
           "AND LOWER(q.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY q.updatedAt DESC")
    List<Quiz> findTopByKeyword(
            @Param("keyword") String keyword,
            @Param("status") QuizStatus status,
            Pageable pageable);
}
