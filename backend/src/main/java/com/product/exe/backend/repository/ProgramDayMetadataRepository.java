package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ProgramDayMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramDayMetadataRepository extends JpaRepository<ProgramDayMetadata, Integer> {
    List<ProgramDayMetadata> findByWeekWeekNumberOrderByDayNumberAsc(Integer weekNumber);

    @Query("SELECT COALESCE(MAX(d.dayNumber), 0) FROM ProgramDayMetadata d")
    int findMaxDayNumber();
}
