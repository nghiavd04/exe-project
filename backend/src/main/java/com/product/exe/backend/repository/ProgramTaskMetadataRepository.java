package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ProgramTaskMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProgramTaskMetadataRepository extends JpaRepository<ProgramTaskMetadata, Long> {
    List<ProgramTaskMetadata> findByProtocolIdAndDayDayNumberOrderByTaskIndexAsc(Long protocolId, Integer dayNumber);
    List<ProgramTaskMetadata> findByProtocolIdAndWeekWeekNumberAndDayIsNullOrderByTaskIndexAsc(Long protocolId, Integer weekNumber);
    
    List<ProgramTaskMetadata> findByDayIdOrderByTaskIndexAsc(Long dayId);
    List<ProgramTaskMetadata> findByWeekIdAndDayIsNullOrderByTaskIndexAsc(Long weekId);
    boolean existsByProtocolIdAndDayDayNumber(Long protocolId, Integer dayNumber);
    
    // Admin management helper
    List<ProgramTaskMetadata> findByProtocolIdOrderByWeekWeekNumberAscTaskIndexAsc(Long protocolId);
}
