package com.product.exe.backend.repository;

import com.product.exe.backend.entity.Payment;
import com.product.exe.backend.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderCode(Long orderCode);

    @Query("SELECT p FROM Payment p JOIN p.customer c JOIN c.user u WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:search IS NULL OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Payment> findAllAdminPayments(@Param("status") PaymentStatus status, @Param("search") String search, Pageable pageable);
}
