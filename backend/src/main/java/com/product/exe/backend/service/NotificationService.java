package com.product.exe.backend.service;

import com.product.exe.backend.entity.User;
import com.product.exe.backend.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {
    void createNotification(User user, String title, String content);
    void createBroadcastNotification(String title, String content);
    List<NotificationResponse> getNotificationsForUser(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
    long getUnreadCount(Long userId);
}
