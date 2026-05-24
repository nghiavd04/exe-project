package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.request.ContactRequest;
import com.product.exe.backend.dto.request.ReplyContactRequest;
import com.product.exe.backend.dto.response.ContactMessageResponse;
import com.product.exe.backend.entity.ContactMessage;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.repository.ContactMessageRepository;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.service.ContactMessageService;
import com.product.exe.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ContactMessageServiceImpl implements ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public void saveContact(ContactRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        // Chống spam: Kiểm tra xem trong vòng 1 phút qua user này có gửi tin nhắn trùng nội dung không
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        boolean existsDuplicate = contactMessageRepository.existsByUserIdAndMessageAndCreatedAtAfter(
                userId, request.getMessage(), oneMinuteAgo);
        if (existsDuplicate) {
            throw new IllegalArgumentException("Bạn đã gửi lời nhắn có nội dung tương tự cách đây ít phút. Vui lòng chờ để chúng tôi phản hồi!");
        }

        String name = user.getCustomer() != null ? user.getCustomer().getFullName() : "Người dùng";
        String email = user.getEmail();

        ContactMessage contactMessage = ContactMessage.builder()
                .user(user)
                .name(name)
                .email(email)
                .message(request.getMessage())
                .isRead(false)
                .build();

        contactMessageRepository.save(contactMessage);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ContactMessageResponse> getContactMessages(String search, Boolean isRead, Boolean isReplied, Pageable pageable) {
        Page<ContactMessage> messages = contactMessageRepository.findAllWithFilter(search, isRead, isReplied, pageable);
        return messages.map(m -> ContactMessageResponse.builder()
                .id(m.getId())
                .userId(m.getUser().getId())
                .name(m.getName())
                .email(m.getEmail())
                .message(m.getMessage())
                .isRead(m.getIsRead())
                .replyMessage(m.getReplyMessage())
                .repliedAt(m.getRepliedAt())
                .repliedByName(m.getRepliedBy() != null ? (m.getRepliedBy().getAdmin() != null ? m.getRepliedBy().getAdmin().getFullName() : "Admin") : null)
                .notes(m.getNotes())
                .createdAt(m.getCreatedAt())
                .build());
    }

    @Override
    @Transactional
    public void replyContactMessage(Long id, ReplyContactRequest request, Long adminId) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lời nhắn liên hệ"));

        // Chống phản hồi trùng lặp: Kiểm tra xem tin nhắn đã được phản hồi chưa
        if (message.getReplyMessage() != null) {
            throw new IllegalArgumentException("Lời nhắn này đã được phản hồi rồi!");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin quản trị viên"));

        message.setReplyMessage(request.getReplyMessage());
        message.setRepliedAt(LocalDateTime.now());
        message.setIsRead(true);
        message.setRepliedBy(admin);
        if (request.getNotes() != null) {
            message.setNotes(request.getNotes());
        }

        contactMessageRepository.save(message);

        // Tạo thông báo cho người dùng gửi tin nhắn
        String adminName = admin.getAdmin() != null ? admin.getAdmin().getFullName() : "Quản trị viên";
        String notifTitle = "Phản hồi liên hệ từ Dopaless";
        String notifContent = adminName + " đã phản hồi lời nhắn của bạn: \"" + request.getReplyMessage() + "\"";
        notificationService.createNotification(message.getUser(), notifTitle, notifContent);
    }

    @Override
    @Transactional
    public void deleteContactMessage(Long id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lời nhắn liên hệ"));
        if (message.getReplyMessage() != null) {
            throw new IllegalArgumentException("Không thể xóa lời nhắn đã được phản hồi!");
        }
        contactMessageRepository.delete(message);
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lời nhắn liên hệ"));
        if (!message.getIsRead()) {
            message.setIsRead(true);
            contactMessageRepository.save(message);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return contactMessageRepository.countByIsReadFalse();
    }
}
