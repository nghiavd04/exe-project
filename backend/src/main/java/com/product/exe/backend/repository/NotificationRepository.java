package com.product.exe.backend.repository;

import com.product.exe.backend.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    long countByUserIdAndIsReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId")
    void markAllAsReadForUser(@Param("userId") Long userId);

    @Query("SELECT n FROM Notification n " +
           "WHERE (n.user.id = :userId) " +
           "OR (n.planTier = :userTier AND :userCreatedAt <= n.createdAt) " +
           "OR (n.user IS NULL AND n.planTier IS NULL AND :userCreatedAt <= n.createdAt) " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findAllForUser(
            @Param("userId") Long userId, 
            @Param("userTier") com.product.exe.backend.enums.SubscriptionTier userTier, 
            @Param("userCreatedAt") java.time.LocalDateTime userCreatedAt);

    @Query("SELECT count(n) FROM Notification n " +
           "WHERE (n.user.id = :userId AND n.isRead = false) " +
           "OR (n.planTier = :userTier AND :userCreatedAt <= n.createdAt AND " +
           "NOT EXISTS (SELECT unr FROM UserNotificationRead unr WHERE unr.user.id = :userId AND unr.notification.id = n.id)) " +
           "OR (n.user IS NULL AND n.planTier IS NULL AND :userCreatedAt <= n.createdAt AND " +
           "NOT EXISTS (SELECT unr FROM UserNotificationRead unr WHERE unr.user.id = :userId AND unr.notification.id = n.id))")
    long countUnreadForUser(
            @Param("userId") Long userId, 
            @Param("userTier") com.product.exe.backend.enums.SubscriptionTier userTier, 
            @Param("userCreatedAt") java.time.LocalDateTime userCreatedAt);

    @Query("SELECT n FROM Notification n " +
           "WHERE (:userCreatedAt <= n.createdAt) " +
           "AND (n.planTier = :userTier OR (n.user IS NULL AND n.planTier IS NULL)) " +
           "AND NOT EXISTS (SELECT unr FROM UserNotificationRead unr WHERE unr.user.id = :userId AND unr.notification.id = n.id)")
    List<Notification> findUnreadGlobalAndGroupNotificationsForUser(
            @Param("userId") Long userId, 
            @Param("userTier") com.product.exe.backend.enums.SubscriptionTier userTier, 
            @Param("userCreatedAt") java.time.LocalDateTime userCreatedAt);
}
