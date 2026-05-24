package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.request.LoginRequest;
import com.product.exe.backend.dto.request.RegisterRequest;
import com.product.exe.backend.dto.response.LoginResponse;
import com.product.exe.backend.dto.response.RegisterResponse;
import com.product.exe.backend.entity.Customer;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.enums.AuthProvider;
import com.product.exe.backend.enums.Role;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.repository.CustomerRepository;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.security.JwtTokenProvider;
import com.product.exe.backend.repository.EmailVerificationRepository;
import com.product.exe.backend.service.AuthService;
import com.product.exe.backend.service.EmailService;
import com.product.exe.backend.service.NotificationService;
import com.product.exe.backend.entity.EmailVerification;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailVerificationRepository verificationRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String jwt = tokenProvider.generateToken(user);
        String fullName = user.getCustomer() != null ? user.getCustomer().getFullName() : user.getEmail();
        String avatarUrl = user.getCustomer() != null ? user.getCustomer().getAvatarUrl() : "";

        return LoginResponse.builder()
                .token(jwt)
                .expiresIn((long) jwtExpirationMs)
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(fullName)
                .avatarUrl(avatarUrl)
                .build();
    }

    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email already exists!");
        }

        // Check if email is verified
        EmailVerification verification = verificationRepository.findTopByEmailOrderByExpiryDateDesc(registerRequest.getEmail())
                .orElseThrow(() -> new BadRequestException("Email not verified! Please request a code first."));
        
        if (!verification.isVerified()) {
            throw new BadRequestException("Email not verified! Please enter the code received.");
        }

        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .provider(AuthProvider.LOCAL)
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();
        User savedUser = userRepository.save(user);

        Customer customer = Customer.builder()
                .user(savedUser)
                .fullName(registerRequest.getFullName())
                .isActive(true)
                .build();
        customerRepository.save(customer);

        // Gửi lời chào mừng cho tài khoản mới đăng ký
        notificationService.createNotification(
                savedUser,
                "Chào mừng bạn đến với Dopaless! 🎉",
                "Cảm ơn bạn đã tham gia cùng chúng tôi. Hãy bắt đầu cải thiện thói quen của mình bằng cách thực hiện bài trắc nghiệm Dopamine đầu tiên nhé!"
        );

        // Delete verification record after successful registration
        verificationRepository.delete(verification);

        return RegisterResponse.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .fullName(registerRequest.getFullName())
                .message("Registration successful! Please login to continue.")
                .build();
    }

    @Override
    @Transactional
    public void sendVerificationCode(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already exists!");
        }

        String code = String.format("%06d", new Random().nextInt(999999));
        
        EmailVerification verification = verificationRepository.findTopByEmailOrderByExpiryDateDesc(email)
                .orElse(EmailVerification.builder().email(email).build());
        
        verification.setCode(code);
        verification.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        verification.setVerified(false);
        
        verificationRepository.save(verification);
        emailService.sendVerificationCode(email, code);
    }

    @Override
    @Transactional
    public void verifyCode(String email, String code) {
        EmailVerification verification = verificationRepository.findTopByEmailOrderByExpiryDateDesc(email)
                .orElseThrow(() -> new BadRequestException("Verification code not found! Please request a new one."));
        
        if (verification.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification code expired!");
        }
        
        if (!verification.getCode().equals(code)) {
            throw new BadRequestException("Invalid verification code!");
        }
        
        verification.setVerified(true);
        verificationRepository.save(verification);
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email không tồn tại trong hệ thống!");
        }

        String code = String.format("%06d", new Random().nextInt(999999));
        
        EmailVerification verification = verificationRepository.findTopByEmailOrderByExpiryDateDesc(email)
                .orElse(EmailVerification.builder().email(email).build());
        
        verification.setCode(code);
        verification.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        verification.setVerified(false);
        
        verificationRepository.save(verification);
        emailService.sendVerificationCode(email, code);
    }

    @Override
    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        EmailVerification verification = verificationRepository.findTopByEmailOrderByExpiryDateDesc(email)
                .orElseThrow(() -> new BadRequestException("Mã xác thực không tồn tại!"));
        
        if (!verification.getCode().equals(code)) {
            throw new BadRequestException("Mã xác thực không chính xác!");
        }
        
        if (verification.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã xác thực đã hết hạn!");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Người dùng không tồn tại!"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        verificationRepository.delete(verification);
    }
}

