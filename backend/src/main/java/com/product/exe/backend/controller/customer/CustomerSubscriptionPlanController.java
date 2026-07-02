package com.product.exe.backend.controller.customer;

import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.dto.response.SubscriptionPlanResponse;
import com.product.exe.backend.entity.Customer;
import com.product.exe.backend.entity.Payment;
import com.product.exe.backend.entity.SubscriptionPlan;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.entity.UserSubscription;
import com.product.exe.backend.enums.PaymentMethod;
import com.product.exe.backend.enums.PaymentStatus;
import com.product.exe.backend.enums.SubscriptionStatus;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.exception.ResourceNotFoundException;
import com.product.exe.backend.repository.CustomerRepository;
import com.product.exe.backend.repository.PaymentRepository;
import com.product.exe.backend.repository.SubscriptionPlanRepository;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.repository.UserSubscriptionRepository;
import com.product.exe.backend.service.SubscriptionPlanService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customer/subscription-plans")
@RequiredArgsConstructor
public class CustomerSubscriptionPlanController {

    private final SubscriptionPlanService subscriptionPlanService;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final PaymentRepository paymentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionPlanResponse>>> getActivePlans() {
        return ResponseEntity.ok(ApiResponse.success(subscriptionPlanService.getActivePlans()));
    }




    @GetMapping("/upgrade-preview")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<UpgradePreviewResponse>> getUpgradePreview(
            @RequestParam("targetPlanId") Long targetPlanId,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));
        
        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        SubscriptionPlan targetPlan = subscriptionPlanRepository.findById(targetPlanId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói dịch vụ mục tiêu"));

        // Tìm gói đăng ký đang hoạt động
        Optional<UserSubscription> activeSubOpt = userSubscriptionRepository.findActiveSubscriptionByUserId(user.getId());
        
        UpgradePreviewResponse response = new UpgradePreviewResponse();
        response.setTargetPlanId(targetPlanId);
        response.setTargetPlanName(targetPlan.getName());
        response.setTargetPlanPrice(targetPlan.getPrice());
        
        if (activeSubOpt.isPresent()) {
            UserSubscription activeSub = activeSubOpt.get();
            SubscriptionPlan currentPlan = activeSub.getPlan();
            
            if (targetPlan.getTier().getWeight() <= currentPlan.getTier().getWeight()) {
                throw new BadRequestException("Gói mục tiêu phải có thứ hạng cao hơn gói dịch vụ hiện tại");
            }
            
            response.setCurrentPlanName(currentPlan.getName());
            response.setCurrentPlanPrice(currentPlan.getPrice());
            
            long remainingDays = 0;
            if (activeSub.getEndDate().isAfter(LocalDateTime.now())) {
                remainingDays = Duration.between(LocalDateTime.now(), activeSub.getEndDate()).toDays();
                int totalDays = currentPlan.getDurationDays() > 0 ? currentPlan.getDurationDays() : 30;
                if (remainingDays > totalDays) {
                    remainingDays = totalDays;
                }
            }
            response.setRemainingDays(remainingDays);
            
            // Tính toán giá trị còn lại
            BigDecimal remainingValue = BigDecimal.ZERO;
            if (remainingDays > 0 && currentPlan.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal totalDaysBd = BigDecimal.valueOf(currentPlan.getDurationDays() > 0 ? currentPlan.getDurationDays() : 30);
                BigDecimal remainingDaysBd = BigDecimal.valueOf(remainingDays);
                remainingValue = currentPlan.getPrice()
                        .multiply(remainingDaysBd)
                        .divide(totalDaysBd, 2, RoundingMode.HALF_UP);
            }
            response.setRemainingValue(remainingValue);
            
            // Số tiền nâng cấp = giá gói mới - giá trị còn lại
            BigDecimal upgradeAmount = targetPlan.getPrice().subtract(remainingValue);
            if (upgradeAmount.compareTo(BigDecimal.ZERO) < 0) {
                upgradeAmount = BigDecimal.ZERO;
            }
            response.setUpgradeAmount(upgradeAmount);
            response.setUpgrade(true);
        } else {
            response.setCurrentPlanName("Không có");
            response.setCurrentPlanPrice(BigDecimal.ZERO);
            response.setRemainingDays(0L);
            response.setRemainingValue(BigDecimal.ZERO);
            response.setUpgradeAmount(targetPlan.getPrice());
            response.setUpgrade(false);
        }
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @Data
    public static class UpgradePreviewResponse {
        private Long targetPlanId;
        private String targetPlanName;
        private BigDecimal targetPlanPrice;
        private String currentPlanName;
        private BigDecimal currentPlanPrice;
        private long remainingDays;
        private BigDecimal remainingValue;
        private BigDecimal upgradeAmount;
        private boolean isUpgrade;
    }
}
