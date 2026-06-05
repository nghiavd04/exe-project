package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.response.AdminManagerAccountRespone;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.enums.Role;
import com.product.exe.backend.exception.ResourceNotFoundException;

import com.product.exe.backend.repository.AdminRepository;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.repository.UserSubscriptionRepository;
import com.product.exe.backend.repository.UserProgramProgressRepository;
import com.product.exe.backend.repository.UserDailyLogRepository;
import com.product.exe.backend.repository.UserWeeklyLogRepository;
import com.product.exe.backend.service.AdminManagerAccountService;
import com.product.exe.backend.dto.response.AdminUserProgressDetailsResponse;
import com.product.exe.backend.entity.Customer;
import com.product.exe.backend.entity.UserDailyLog;
import com.product.exe.backend.entity.UserWeeklyLog;
import com.product.exe.backend.entity.UserProgramProgress;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminManagerAccountServiceImpl implements AdminManagerAccountService {

    private final UserRepository userRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final AdminRepository adminRepository;
    private final UserProgramProgressRepository userProgramProgressRepository;
    private final UserDailyLogRepository userDailyLogRepository;
    private final UserWeeklyLogRepository userWeeklyLogRepository;
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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với mã id: " + userId));
        
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
        Integer currentDay = null;
        Integer streakCount = null;
        String programStatus = null;

        if (user.getRole() == Role.CUSTOMER && user.getCustomer() != null) {
            fullName = user.getCustomer().getFullName();
            avatarUrl = user.getCustomer().getAvatarUrl();
            
            // Lấy thông tin gói dịch vụ
            subscriptionPlan = userSubscriptionRepository.findActiveSubscriptionByUserId(user.getId())
                    .map(sub -> sub.getPlan().getName())
                    .orElse("Miễn phí");

            // Lấy tiến trình lộ trình phác đồ
            UserProgramProgress progress = userProgramProgressRepository.findByCustomerId(user.getCustomer().getId()).orElse(null);
            if (progress != null) {
                currentDay = progress.getCurrentDay();
                streakCount = progress.getStreakCount();
                programStatus = progress.getStatus().name();
            }
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
                .currentDay(currentDay)
                .streakCount(streakCount)
                .programStatus(programStatus)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserProgressDetailsResponse getUserProgressDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với mã id: " + userId));

        if (user.getRole() != Role.CUSTOMER || user.getCustomer() == null) {
            throw new com.product.exe.backend.exception.BadRequestException("Người dùng này không phải là khách hàng!");
        }

        Customer customer = user.getCustomer();

        // Lấy thông tin gói dịch vụ
        String subscriptionPlan = userSubscriptionRepository.findActiveSubscriptionByUserId(user.getId())
                .map(sub -> sub.getPlan().getName())
                .orElse("Miễn phí");

        // Lấy thông tin tiến độ
        UserProgramProgress progress = userProgramProgressRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new com.product.exe.backend.exception.BadRequestException("Khách hàng chưa bắt đầu lộ trình phác đồ!"));

        // Lấy danh sách Daily Logs và Weekly Logs
        java.util.List<UserDailyLog> dailyLogs = userDailyLogRepository.findByCustomerIdOrderByDayNumberAsc(customer.getId());
        java.util.List<UserWeeklyLog> weeklyLogs = userWeeklyLogRepository.findByCustomerIdOrderByWeekNumberAsc(customer.getId());

        // Map Daily Logs
        java.util.List<AdminUserProgressDetailsResponse.DailyLogDto> dailyLogDtos = dailyLogs.stream()
                .map(dl -> AdminUserProgressDetailsResponse.DailyLogDto.builder()
                        .dayNumber(dl.getDayNumber())
                        .screenTimeMinutes(dl.getScreenTimeMinutes())
                        .unconsciousOpenCount(dl.getUnconsciousOpenCount())
                        .urgeLevel(dl.getUrgeLevel())
                        .sleepHours(dl.getSleepHours())
                        .moodScore(dl.getMoodScore())
                        .sleepScore(dl.getSleepScore())
                        .urgeScore(dl.getUrgeScore())
                        .focusScore(dl.getFocusScore())
                        .createdAt(dl.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        // Map Weekly Logs
        java.util.List<AdminUserProgressDetailsResponse.WeeklyLogDto> weeklyLogDtos = weeklyLogs.stream()
                .map(wl -> AdminUserProgressDetailsResponse.WeeklyLogDto.builder()
                        .weekNumber(wl.getWeekNumber())
                        .screenTimeAvgMinutes(wl.getScreenTimeAvgMinutes())
                        .moodAvgScore(wl.getMoodAvgScore())
                        .deepWorkAvgMinutes(wl.getDeepWorkAvgMinutes())
                        .outputCount(wl.getOutputCount())
                        .socialMediaAvgMinutes(wl.getSocialMediaAvgMinutes())
                        .streakCount(wl.getStreakCount())
                        .relationshipSatisfaction(wl.getRelationshipSatisfaction())
                        .createdAt(wl.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return AdminUserProgressDetailsResponse.builder()
                .currentDay(progress.getCurrentDay())
                .streakCount(progress.getStreakCount())
                .startedAt(progress.getStartedAt())
                .lastCheckedInAt(progress.getLastCheckedInAt())
                .status(progress.getStatus().name())
                .subscriptionPlan(subscriptionPlan)
                .dailyLogs(dailyLogDtos)
                .weeklyLogs(weeklyLogDtos)
                .build();
    }
}
