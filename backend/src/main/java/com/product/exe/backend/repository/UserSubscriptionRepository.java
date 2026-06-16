package com.product.exe.backend.repository;

import com.product.exe.backend.entity.UserSubscription;
import com.product.exe.backend.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {

    @Query("SELECT us FROM UserSubscription us " +
           "JOIN us.customer c " +
           "JOIN c.user u " +
           "WHERE u.id = :userId " +
           "AND us.status = :status " +
           "AND us.endDate > :now")
    Optional<UserSubscription> findFirstByUserIdAndStatusAndEndDateAfter(
            @Param("userId") Long userId,
            @Param("status") SubscriptionStatus status,
            @Param("now") LocalDateTime now);

    long countByPlanIdAndStatus(Long planId, SubscriptionStatus status);

    @Query("SELECT us.plan.name as planName, COUNT(us) as count FROM UserSubscription us WHERE us.status = :status GROUP BY us.plan.name")
    List<Object[]> countSubscriptionsByPlanName(@Param("status") SubscriptionStatus status);

    long countByStatus(SubscriptionStatus status);

    boolean existsByPlanId(Long planId);

    @Query("SELECT us FROM UserSubscription us " +
           "WHERE us.customer.id = :customerId " +
           "AND us.status = :status")
    List<UserSubscription> findAllByCustomerIdAndStatus(
            @Param("customerId") Long customerId,
            @Param("status") SubscriptionStatus status);

    default Optional<UserSubscription> findActiveSubscriptionByUserId(Long userId) {
        return findFirstByUserIdAndStatusAndEndDateAfter(userId, SubscriptionStatus.ACTIVE, LocalDateTime.now());
    }
}
