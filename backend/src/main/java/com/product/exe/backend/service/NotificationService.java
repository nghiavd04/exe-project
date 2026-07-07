package com.product.exe.backend.service;

import com.product.exe.backend.entity.User;
import com.product.exe.backend.dto.response.AdminNotificationResponse;
import com.product.exe.backend.dto.response.NotificationResponse;
import com.product.exe.backend.enums.SubscriptionTier;
import com.product.exe.backend.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    void createNotification(User user, String title, String content);
    void createBroadcastNotification(String title, String content);
    void createTargetedNotification(String title, String content, String targetEmail, SubscriptionTier targetPlanTier, Boolean sendEmail, NotificationType type);
    List<NotificationResponse> getNotificationsForUser(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
    long getUnreadCount(Long userId);

    Page<AdminNotificationResponse> getSentNotifications(NotificationType type, Pageable pageable);
}
