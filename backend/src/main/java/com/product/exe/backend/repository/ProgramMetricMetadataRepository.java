package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ProgramMetricMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProgramMetricMetadataRepository extends JpaRepository<ProgramMetricMetadata, Long> {
    List<ProgramMetricMetadata> findByProtocolIdAndDayDayNumber(Long protocolId, Integer dayNumber);
    List<ProgramMetricMetadata> findByProtocolIdAndWeekWeekNumberAndDayIsNull(Long protocolId, Integer weekNumber);
}
