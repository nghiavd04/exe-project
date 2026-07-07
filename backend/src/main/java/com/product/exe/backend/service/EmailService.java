package com.product.exe.backend.service;

public interface EmailService {
    void sendVerificationCode(String to, String code);
    void sendNotificationEmail(String to, String title, String htmlContent);
}
