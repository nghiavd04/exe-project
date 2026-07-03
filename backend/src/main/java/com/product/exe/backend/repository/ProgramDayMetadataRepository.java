package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ProgramDayMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProgramDayMetadataRepository extends JpaRepository<ProgramDayMetadata, Long> {
    List<ProgramDayMetadata> findByProtocolIdAndWeekWeekNumberOrderByDayNumberAsc(Long protocolId, Integer weekNumber);

    Optional<ProgramDayMetadata> findByProtocolIdAndDayNumber(Long protocolId, Integer dayNumber);

    @Query("SELECT COALESCE(MAX(d.dayNumber), 0) FROM ProgramDayMetadata d WHERE d.protocol.id = :protocolId")
    int findMaxDayNumber(Long protocolId);
}
