package com.product.exe.backend.repository;

import com.product.exe.backend.entity.Payment;
import com.product.exe.backend.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderCode(Long orderCode);

    List<Payment> findAllByStatusInAndCreatedAtBefore(List<PaymentStatus> statuses, LocalDateTime threshold);

    List<Payment> findTop5ByOrderByCreatedAtDesc();

    @Query("SELECT p FROM Payment p JOIN p.customer c JOIN c.user u WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:search IS NULL OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Payment> findAllAdminPayments(@Param("status") PaymentStatus status, @Param("search") String search, Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") PaymentStatus status);

    @Query(value = "SELECT DATE(paid_at) as date, SUM(amount) as total FROM payments WHERE status = :status AND paid_at >= :startDate GROUP BY DATE(paid_at) ORDER BY DATE(paid_at)", nativeQuery = true)
    List<Object[]> sumAmountByDateSinceNative(@Param("status") String status, @Param("startDate") LocalDateTime startDate);
}
