package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ProgramPhaseMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProgramPhaseMetadataRepository extends JpaRepository<ProgramPhaseMetadata, Long> {
    List<ProgramPhaseMetadata> findByProtocolIdOrderByPhaseNumberAsc(Long protocolId);
    Optional<ProgramPhaseMetadata> findByProtocolIdAndPhaseNumber(Long protocolId, Integer phaseNumber);
}
