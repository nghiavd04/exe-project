package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.response.AdminManagerAccountRespone;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.enums.Role;
import com.product.exe.backend.exception.ResourceNotFoundException;

import com.product.exe.backend.repository.AdminRepository;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.repository.UserSubscriptionRepository;
import com.product.exe.backend.service.AdminManagerAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminManagerAccountServiceImpl implements AdminManagerAccountService {

    private final UserRepository userRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final AdminRepository adminRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminManagerAccountRespone> getAllUsers(String search, Role role, Boolean isActive, Pageable pageable) {
        return userRepository.findAllUsersWithFilter(search, role, isActive, pageable)
                .map(this::mapToAdminManagerAccountRespone);
    }

    @Override
    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        boolean newStatus = !user.getIsActive();
        user.setIsActive(newStatus);
        
        // Cập nhật trạng thái trong profile tương ứng
        if (user.getRole() == Role.CUSTOMER && user.getCustomer() != null) {
            user.getCustomer().setIsActive(newStatus);
        } else if (user.getRole() == Role.ADMIN && user.getAdmin() != null) {
            user.getAdmin().setIsActive(newStatus);
        }
        
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void createAdmin(com.product.exe.backend.dto.request.AdminCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new com.product.exe.backend.exception.BadRequestException("Email đã được sử dụng!");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .provider(com.product.exe.backend.enums.AuthProvider.LOCAL)
                .isActive(true)
                .build();
        User savedUser = userRepository.save(user);

        com.product.exe.backend.entity.Admin admin = com.product.exe.backend.entity.Admin.builder()
                .user(savedUser)
                .fullName(request.getFullName())
                .isActive(true)
                .build();
        adminRepository.save(admin);
    }

    private AdminManagerAccountRespone mapToAdminManagerAccountRespone(User user) {
        String fullName = "Unknown";
        String avatarUrl = null;
        String subscriptionPlan = "None";

        if (user.getRole() == Role.CUSTOMER && user.getCustomer() != null) {
            fullName = user.getCustomer().getFullName();
            avatarUrl = user.getCustomer().getAvatarUrl();
            
            // Lấy thông tin gói dịch vụ
            subscriptionPlan = userSubscriptionRepository.findActiveSubscriptionByUserId(user.getId())
                    .map(sub -> sub.getPlan().getName())
                    .orElse("FREE");
        } else if (user.getRole() == Role.ADMIN && user.getAdmin() != null) {
            fullName = user.getAdmin().getFullName();
            avatarUrl = user.getAdmin().getAvatarUrl();
            subscriptionPlan = "ADMIN";
        }

        return AdminManagerAccountRespone.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(fullName)
                .role(user.getRole())
                .avatarUrl(avatarUrl)
                .isActive(user.getIsActive())
                .subscriptionPlan(subscriptionPlan)
                .build();
    }
}
