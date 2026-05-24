package com.product.exe.backend.service;

import com.product.exe.backend.dto.request.ContactRequest;
import com.product.exe.backend.dto.request.ReplyContactRequest;
import com.product.exe.backend.dto.response.ContactMessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ContactMessageService {
    void saveContact(ContactRequest request, Long userId);
    Page<ContactMessageResponse> getContactMessages(String search, Boolean isRead, Boolean isReplied, Pageable pageable);
    void replyContactMessage(Long id, ReplyContactRequest request, Long adminId);
    void deleteContactMessage(Long id);
    void markAsRead(Long id);
    long getUnreadCount();
}
