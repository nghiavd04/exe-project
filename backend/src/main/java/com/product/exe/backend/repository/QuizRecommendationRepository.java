package com.product.exe.backend.repository;

import com.product.exe.backend.entity.QuizRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRecommendationRepository extends JpaRepository<QuizRecommendation, Long> {
    List<QuizRecommendation> findByCustomerIdAndStatus(Long customerId, String status);
    List<QuizRecommendation> findByQuizAttemptId(Long quizAttemptId);

    @Modifying
    @Query("UPDATE QuizRecommendation qr SET qr.status = 'SUPERSEDED' WHERE qr.customer.id = :customerId AND qr.status = 'PENDING'")
    void supersedeAllPendingForCustomer(Long customerId);
}
