package com.product.exe.backend.service.impl;

import com.product.exe.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String senderEmail;


    @Override
    public void sendVerificationCode(String to, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, "Dopaless Support");

            helper.setTo(to);
            helper.setSubject("Mã xác thực đăng ký tài khoản");

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;'>" +
                    "<h2 style='color: #2563eb; text-align: center;'>Xác thực tài khoản</h2>" +
                    "<p>Chào bạn,</p>" +
                    "<p>Bạn vừa yêu cầu mã xác thực để đăng ký tài khoản tại <b>Dopaless</b>. Vui lòng sử dụng mã dưới đây để hoàn tất:</p>" +
                    "<div style='background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; text-align: center; margin: 20px 0;'>" +
                    "<span style='font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e293b;'>" + code + "</span>" +
                    "</div>" +
                    "<p style='color: #64748b; font-size: 14px;'>Mã này sẽ hết hạn trong vòng 10 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>" +
                    "<hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;'>" +
                    "<p style='text-align: center; color: #94a3b8; font-size: 12px;'>© 2026 Dopaless. Bảo lưu mọi quyền.</p>" +
                    "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gửi email xác thực: " + e.getMessage());
        }
    }

    @Override
    public void sendNotificationEmail(String to, String title, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, "Dopaless Support");
            helper.setTo(to);
            helper.setSubject(title);

            String template = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;'>" +
                    "<h2 style='color: #0d9488; text-align: center; margin-bottom: 20px;'>" + title + "</h2>" +
                    "<div style='color: #334155; font-size: 16px; line-height: 1.6;'>" +
                    htmlContent +
                    "</div>" +
                    "<hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;'>" +
                    "<p style='text-align: center; color: #94a3b8; font-size: 12px;'>Đây là email tự động từ hệ thống Dopaless. Vui lòng không phản hồi email này.</p>" +
                    "<p style='text-align: center; color: #94a3b8; font-size: 12px;'>© 2026 Dopaless. Bảo lưu mọi quyền.</p>" +
                    "</div>";

            helper.setText(template, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gửi email thông báo: " + e.getMessage());
        }
    }
}
