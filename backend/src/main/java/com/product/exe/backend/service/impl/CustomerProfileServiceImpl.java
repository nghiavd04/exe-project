package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.request.ChangePasswordRequest;
import com.product.exe.backend.dto.request.UpdateProfileRequest;
import com.product.exe.backend.dto.response.UserProfileResponse;
import com.product.exe.backend.entity.Customer;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.entity.EmailVerification;
import com.product.exe.backend.repository.CustomerRepository;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.repository.EmailVerificationRepository;
import com.product.exe.backend.security.JwtTokenProvider;
import com.product.exe.backend.service.CustomerProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.product.exe.backend.service.SubscriptionService;

@Service
@RequiredArgsConstructor
public class CustomerProfileServiceImpl implements CustomerProfileService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final EmailVerificationRepository verificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final SubscriptionService subscriptionService;


    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        return convertToResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(String currentEmail, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));

        // If email is changing, check if new email exists
        if (!currentEmail.equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email đã được sử dụng");
            }
            user.setEmail(request.getEmail());
        }

        if (user.getCustomer() != null) {
            Customer customer = user.getCustomer();
            customer.setFullName(request.getFullName());
            customerRepository.save(customer);
        }

        userRepository.save(user);
        
        UserProfileResponse response = convertToResponse(user);
        
        // If email was changed, generate new token
        if (!currentEmail.equals(request.getEmail())) {
            String newToken = jwtTokenProvider.generateToken(user);
            response.setToken(newToken);
        }
        
        return response;
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu cũ không chính xác");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void changeEmail(String currentEmail, String newEmail, String code) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));

        // Verify OTP for NEW email
        EmailVerification verification = verificationRepository.findTopByEmailOrderByExpiryDateDesc(newEmail)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy mã xác thực cho email mới"));

        if (!verification.getCode().equals(code)) {
            throw new BadRequestException("Mã xác thực không hợp lệ");
        }

        if (verification.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("Mã xác thực đã hết hạn");
        }

        // Check if new email is already in use by another user
        if (userRepository.existsByEmail(newEmail)) {
            throw new BadRequestException("Email đã được sử dụng");
        }

        user.setEmail(newEmail);
        userRepository.save(user);
        
        // Clean up verification
        verificationRepository.delete(verification);
    }


    @Override
    @Transactional
    public UserProfileResponse updateAvatar(String email, String avatarUrl, String publicId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));

        if (user.getCustomer() != null) {
            Customer customer = user.getCustomer();
            customer.setAvatarUrl(avatarUrl);
            customer.setAvatarPublicId(publicId);
            customerRepository.save(customer);
        }

        return convertToResponse(user);
    }

    private UserProfileResponse convertToResponse(User user) {
        String fullName = "";
        String avatarUrl = "";
        if (user.getCustomer() != null) {
            fullName = user.getCustomer().getFullName();
            avatarUrl = user.getCustomer().getAvatarUrl();
        } else if (user.getAdmin() != null) {
            fullName = user.getAdmin().getFullName();
        }

        String tier = subscriptionService.getUserHighestTier(user.getId()).name();

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(fullName)
                .avatarUrl(avatarUrl)
                .role(user.getRole().name())
                .subscriptionTier(tier)
                .provider(user.getProvider().name())
                .build();
    }
}
