package com.product.exe.backend.repository;

import com.product.exe.backend.entity.UserNotificationRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserNotificationReadRepository extends JpaRepository<UserNotificationRead, Long> {
    boolean existsByUserIdAndNotificationId(Long userId, Long notificationId);
    
    Optional<UserNotificationRead> findByUserIdAndNotificationId(Long userId, Long notificationId);

    @Query("SELECT unr.notification.id FROM UserNotificationRead unr WHERE unr.user.id = :userId")
    List<Long> findReadNotificationIdsByUserId(@Param("userId") Long userId);
}
