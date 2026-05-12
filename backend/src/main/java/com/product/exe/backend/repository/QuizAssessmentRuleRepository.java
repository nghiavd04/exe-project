package com.product.exe.backend.repository;

import com.product.exe.backend.entity.QuizAssessmentRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAssessmentRuleRepository extends JpaRepository<QuizAssessmentRule, Long> {
    List<QuizAssessmentRule> findAllByQuizIdAndIsActiveTrue(Long quizId);
    
    @Modifying
    @Query("UPDATE QuizAssessmentRule r SET r.isActive = false WHERE r.quiz.id = :quizId")
    void markAllAsInactiveByQuizId(Long quizId);
}
