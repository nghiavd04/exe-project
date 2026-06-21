package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ProgramMedia;
import com.product.exe.backend.enums.MediaType;
import com.product.exe.backend.enums.SubscriptionTier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramMediaRepository extends JpaRepository<ProgramMedia, Long> {
    List<ProgramMedia> findAllByOrderByDayNumberAsc();

    @Query("SELECT m FROM ProgramMedia m WHERE " +
           "(:type IS NULL OR m.mediaType = :type) AND " +
           "(:tier IS NULL OR m.targetTier = :tier) AND " +
           "(:search IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY m.dayNumber ASC, m.id DESC")
    Page<ProgramMedia> findMediasWithFilters(
            @Param("type") MediaType type, 
            @Param("tier") SubscriptionTier tier, 
            @Param("search") String search, 
            Pageable pageable);
}
