package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ProgramTaskMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramTaskMetadataRepository extends JpaRepository<ProgramTaskMetadata, Long> {
    List<ProgramTaskMetadata> findByDayDayNumberOrderByTaskIndexAsc(Integer dayNumber);
    List<ProgramTaskMetadata> findByWeekWeekNumberAndDayIsNullOrderByTaskIndexAsc(Integer weekNumber);
}
