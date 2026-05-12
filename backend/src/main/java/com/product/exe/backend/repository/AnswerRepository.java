package com.product.exe.backend.repository;

import com.product.exe.backend.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findAllByQuestionIdAndIsActiveTrueOrderByOrderIndexAsc(Long questionId);
    
    List<Answer> findAllByQuestionIdInAndIsActiveTrueOrderByOrderIndexAsc(List<Long> questionIds);
    
    @Modifying
    @Query("UPDATE Answer a SET a.isActive = false WHERE a.question.id = :questionId")
    void markAllAsInactiveByQuestionId(Long questionId);
}
