package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.response.NotificationResponse;
import com.product.exe.backend.entity.Notification;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.entity.UserNotificationRead;
import com.product.exe.backend.repository.NotificationRepository;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.repository.UserNotificationReadRepository;
import com.product.exe.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final UserNotificationReadRepository userNotificationReadRepository;

    @Override
    @Transactional
    public void createNotification(User user, String title, String content) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .content(content)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void createBroadcastNotification(String title, String content) {
        Notification notification = Notification.builder()
                .user(null) // user == null is a global broadcast notification
                .title(title)
                .content(content)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        // Lấy danh sách thông báo hợp lệ của user (cá nhân hoặc thông báo chung tạo sau ngày tạo tài khoản của user)
        List<Notification> notifications = notificationRepository.findAllForUser(userId, user.getCreatedAt());

        // Lấy tất cả ID thông báo chung đã đọc của user này
        List<Long> readGlobalNotificationIds = userNotificationReadRepository.findReadNotificationIdsByUserId(userId);

        return notifications.stream()
                .map(n -> {
                    boolean isRead;
                    if (n.getUser() != null) {
                        isRead = n.getIsRead();
                    } else {
                        isRead = readGlobalNotificationIds.contains(n.getId());
                    }
                    return NotificationResponse.builder()
                            .id(n.getId())
                            .title(n.getTitle())
                            .content(n.getContent())
                            .isRead(isRead)
                            .createdAt(n.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông báo"));

        if (notification.getUser() != null) {
            // Thông báo cá nhân
            if (!notification.getUser().getId().equals(userId)) {
                throw new SecurityException("Không có quyền truy cập thông báo này");
            }
            notification.setIsRead(true);
            notificationRepository.save(notification);
        } else {
            // Thông báo chung
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
            
            // Đảm bảo user này đủ điều kiện nhận thông báo chung (đăng ký trước khi thông báo được tạo)
            if (user.getCreatedAt().isAfter(notification.getCreatedAt())) {
                throw new SecurityException("Không có quyền truy cập thông báo này");
            }

            if (!userNotificationReadRepository.existsByUserIdAndNotificationId(userId, notificationId)) {
                UserNotificationRead readRecord = UserNotificationRead.builder()
                        .user(user)
                        .notification(notification)
                        .build();
                userNotificationReadRepository.save(readRecord);
            }
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        // 1. Đánh dấu đọc tất cả thông báo cá nhân
        notificationRepository.markAllAsReadForUser(userId);

        // 2. Đánh dấu đọc tất cả thông báo chung chưa đọc
        List<Notification> unreadGlobalNotifications = notificationRepository.findUnreadGlobalNotificationsForUser(userId, user.getCreatedAt());
        for (Notification n : unreadGlobalNotifications) {
            if (!userNotificationReadRepository.existsByUserIdAndNotificationId(userId, n.getId())) {
                UserNotificationRead readRecord = UserNotificationRead.builder()
                        .user(user)
                        .notification(n)
                        .build();
                userNotificationReadRepository.save(readRecord);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        return notificationRepository.countUnreadForUser(userId, user.getCreatedAt());
    }
}
