package com.product.exe.backend.service;

import com.product.exe.backend.dto.request.PayOSWebhookRequest;
import com.product.exe.backend.dto.response.PayOSResponse;

public interface PayOSService {
    PayOSResponse createPaymentLink(Long planId, String email);
    void handleWebhook(PayOSWebhookRequest request);
    PayOSResponse syncPaymentStatus(Long orderCode);
}
