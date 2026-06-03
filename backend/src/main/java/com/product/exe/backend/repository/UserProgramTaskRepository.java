package com.product.exe.backend.repository;

import com.product.exe.backend.entity.UserProgramTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgramTaskRepository extends JpaRepository<UserProgramTask, Long> {
    List<UserProgramTask> findByCustomerIdAndDayNumber(Long customerId, Integer dayNumber);
    List<UserProgramTask> findByCustomerIdAndWeekNumberAndDayNumberIsNull(Long customerId, Integer weekNumber);
    Optional<UserProgramTask> findByCustomerIdAndDayNumberAndWeekNumberAndTaskIndex(Long customerId, Integer dayNumber, Integer weekNumber, Integer taskIndex);
    Optional<UserProgramTask> findByCustomerIdAndDayNumberIsNullAndWeekNumberAndTaskIndex(Long customerId, Integer weekNumber, Integer taskIndex);
    
    // For checking if all tasks of a specific day are completed
    long countByCustomerIdAndDayNumberAndIsCompletedTrue(Long customerId, Integer dayNumber);
    // For checking if all tasks of a specific week are completed
    long countByCustomerIdAndWeekNumberAndDayNumberIsNullAndIsCompletedTrue(Long customerId, Integer weekNumber);
    // For overall analytics
    long countByCustomerIdAndIsCompletedTrue(Long customerId);
}
