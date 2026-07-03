package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ProgramReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProgramReviewRepository extends JpaRepository<ProgramReview, Long> {
    List<ProgramReview> findByUserProgramProgressIdOrderByReviewCycleNumberAsc(Long progressId);
}
