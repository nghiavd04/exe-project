package com.product.exe.backend.repository;

import com.product.exe.backend.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findAllByQuestionIdAndIsActiveTrueOrderByOrderIndexAsc(Long questionId);
}
