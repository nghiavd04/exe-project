package com.product.exe.backend.repository;

import com.product.exe.backend.entity.UserWeeklyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserWeeklyLogRepository extends JpaRepository<UserWeeklyLog, Long> {
    Optional<UserWeeklyLog> findByCustomerIdAndWeekNumber(Long customerId, Integer weekNumber);
    List<UserWeeklyLog> findByCustomerIdOrderByWeekNumberAsc(Long customerId);

    void deleteByCustomerId(Long customerId);
}
