package com.product.exe.backend.repository;

import com.product.exe.backend.entity.UserProgramProgress;
import com.product.exe.backend.enums.UserProgramStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgramProgressRepository extends JpaRepository<UserProgramProgress, Long> {
    Optional<UserProgramProgress> findByCustomerUserId(Long userId);
    Optional<UserProgramProgress> findByCustomerId(Long customerId);
    List<UserProgramProgress> findByStatus(UserProgramStatus status);

    @Query("SELECT p FROM UserProgramProgress p JOIN p.customer c WHERE p.status = :status AND HOUR(c.reminderTime) = :hour AND MINUTE(c.reminderTime) = :minute")
    List<UserProgramProgress> findByStatusAndReminderTime(@Param("status") UserProgramStatus status, @Param("hour") int hour, @Param("minute") int minute);

    long countByStatus(UserProgramStatus status);
    long countByLastCheckedInAtAfter(LocalDateTime date);
}
