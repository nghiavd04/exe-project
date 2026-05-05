package com.product.exe.backend.service;

public interface EmailService {
    void sendVerificationCode(String to, String code);
}
