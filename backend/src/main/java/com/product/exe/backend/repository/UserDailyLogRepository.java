package com.product.exe.backend.repository;

import com.product.exe.backend.entity.UserDailyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDailyLogRepository extends JpaRepository<UserDailyLog, Long> {
    Optional<UserDailyLog> findByCustomerIdAndDayNumber(Long customerId, Integer dayNumber);
    List<UserDailyLog> findByCustomerIdOrderByDayNumberAsc(Long customerId);

    void deleteByCustomerId(Long customerId);
}
