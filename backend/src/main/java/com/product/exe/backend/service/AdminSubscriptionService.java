package com.product.exe.backend.service;

import com.product.exe.backend.dto.response.AdminPaymentResponse;
import com.product.exe.backend.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminSubscriptionService {
    Page<AdminPaymentResponse> getPaymentHistory(PaymentStatus status, String search, Pageable pageable);
}
