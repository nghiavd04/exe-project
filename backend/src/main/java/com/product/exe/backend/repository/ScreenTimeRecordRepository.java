package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ScreenTimeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScreenTimeRecordRepository extends JpaRepository<ScreenTimeRecord, Long> {
    List<ScreenTimeRecord> findByUserId(Long userId);
}
