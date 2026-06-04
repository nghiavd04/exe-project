package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ProgramMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramMediaRepository extends JpaRepository<ProgramMedia, Long> {
    List<ProgramMedia> findAllByOrderByDayNumberAsc();
}
