package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.response.AdminPaymentResponse;
import com.product.exe.backend.entity.Payment;
import com.product.exe.backend.enums.PaymentStatus;
import com.product.exe.backend.repository.PaymentRepository;
import com.product.exe.backend.service.AdminSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminSubscriptionServiceImpl implements AdminSubscriptionService {

    private final PaymentRepository paymentRepository;

    @Override
    public Page<AdminPaymentResponse> getPaymentHistory(PaymentStatus status, String search, Pageable pageable) {
        Page<Payment> payments = paymentRepository.findAllAdminPayments(status, search, pageable);
        return payments.map(this::mapToAdminPaymentResponse);
    }

    private AdminPaymentResponse mapToAdminPaymentResponse(Payment payment) {
        return AdminPaymentResponse.builder()
                .id(payment.getId())
                .orderCode(payment.getOrderCode())
                .customerName(payment.getCustomer() != null ? payment.getCustomer().getFullName() : "N/A")
                .customerEmail(payment.getCustomer() != null && payment.getCustomer().getUser() != null 
                        ? payment.getCustomer().getUser().getEmail() : "N/A")
                .planName(payment.getPlan() != null ? payment.getPlan().getName() : "N/A")
                .planTier(payment.getPlan() != null ? payment.getPlan().getTier().name() : "N/A")
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : "N/A")
                .status(payment.getStatus() != null ? payment.getStatus().name() : "N/A")
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
