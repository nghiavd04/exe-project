package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ProgramWeekMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProgramWeekMetadataRepository extends JpaRepository<ProgramWeekMetadata, Long> {
    List<ProgramWeekMetadata> findByProtocolIdAndPhasePhaseNumberOrderByWeekNumberAsc(Long protocolId, Integer phaseNumber);
    List<ProgramWeekMetadata> findByProtocolIdOrderByWeekNumberAsc(Long protocolId);

    Optional<ProgramWeekMetadata> findByProtocolIdAndWeekNumber(Long protocolId, Integer weekNumber);

    Optional<ProgramWeekMetadata> findByPhaseIdAndWeekNumber(Long phaseId, Integer weekNumber);
    @Query("SELECT COALESCE(MAX(w.weekNumber), 0) FROM ProgramWeekMetadata w WHERE w.protocol.id = :protocolId")
    int findMaxWeekNumber(Long protocolId);
}
