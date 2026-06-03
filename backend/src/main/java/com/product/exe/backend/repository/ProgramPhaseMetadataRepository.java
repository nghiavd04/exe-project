package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ProgramPhaseMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProgramPhaseMetadataRepository extends JpaRepository<ProgramPhaseMetadata, Integer> {
}
