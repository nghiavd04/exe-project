package com.product.exe.backend.repository;

import com.product.exe.backend.entity.Quiz;
import com.product.exe.backend.enums.QuizStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Page<Quiz> findAllByStatus(QuizStatus status, Pageable pageable);
    
    @Query("SELECT q FROM Quiz q " +
           "WHERE q.status = :status AND q.isActive = true " +
           "AND (:search IS NULL OR LOWER(q.title) LIKE :search OR LOWER(q.description) LIKE :search)")
    Page<Quiz> findAllByStatusAndSearch(
            @Param("status") QuizStatus status,
            @Param("search") String search,
            Pageable pageable);

    Optional<Quiz> findByIdAndStatus(Long id, QuizStatus status);
}
