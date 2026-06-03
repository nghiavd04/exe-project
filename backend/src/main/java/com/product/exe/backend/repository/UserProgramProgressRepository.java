package com.product.exe.backend.repository;

import com.product.exe.backend.entity.UserProgramProgress;
import com.product.exe.backend.enums.UserProgramStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgramProgressRepository extends JpaRepository<UserProgramProgress, Long> {
    Optional<UserProgramProgress> findByCustomerUserId(Long userId);
    Optional<UserProgramProgress> findByCustomerId(Long customerId);
    List<UserProgramProgress> findByStatus(UserProgramStatus status);
}
