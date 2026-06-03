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

import java.time.LocalDateTime;
import java.util.List;
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

    @PostMapping("/{id}/subscribe")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> subscribe(
            @PathVariable Long id,
            @RequestBody SubscribeRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));
        
        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói dịch vụ"));

        if (Boolean.FALSE.equals(plan.getIsActive())) {
            throw new BadRequestException("Gói dịch vụ này hiện đã bị ngừng hoạt động");
        }

        // Create new active user subscription
        UserSubscription subscription = UserSubscription.builder()
                .customer(customer)
                .plan(plan)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusDays(plan.getDurationDays()))
                .status(SubscriptionStatus.ACTIVE)
                .build();
        UserSubscription savedSubscription = userSubscriptionRepository.save(subscription);

        // Parse payment method from request
        PaymentMethod method;
        try {
            method = PaymentMethod.valueOf(request.getPaymentMethod());
        } catch (Exception e) {
            method = PaymentMethod.PAYOS; // Default fallback
        }

        // Create associated successful payment record
        Payment payment = Payment.builder()
                .customer(customer)
                .subscription(savedSubscription)
                .plan(plan)
                .amount(plan.getPrice())
                .currency("VND")
                .paymentMethod(method)
                .status(PaymentStatus.SUCCESS)
                .transactionId("MOCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .paidAt(LocalDateTime.now())
                .isActive(true)
                .build();
        paymentRepository.save(payment);

        return ResponseEntity.ok(ApiResponse.success("Đăng ký gói dịch vụ thành công! Cấp độ tài khoản đã được nâng cấp."));
    }

    @Data
    public static class SubscribeRequest {
        private String paymentMethod;
    }
}
