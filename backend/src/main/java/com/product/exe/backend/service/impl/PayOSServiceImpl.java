package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.request.PayOSWebhookRequest;
import com.product.exe.backend.dto.response.PayOSResponse;
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
import com.product.exe.backend.service.PayOSService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.v2.paymentRequests.PaymentLink;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayOSServiceImpl implements PayOSService {

    private final PayOS payOS;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final PaymentRepository paymentRepository;

    @Value("${app.payment.return-url}")
    private String returnUrl;

    @Value("${app.payment.cancel-url}")
    private String cancelUrl;

    @Value("${app.payment.expiry-minutes:15}")
    private int expiryMinutes;

    @Override
    @Transactional
    public PayOSResponse createPaymentLink(Long planId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));

        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói dịch vụ"));

        if (Boolean.FALSE.equals(plan.getIsActive())) {
            throw new BadRequestException("Gói dịch vụ này hiện đã bị ngừng hoạt động");
        }

        // 1. Tạo UserSubscription ở trạng thái PENDING
        UserSubscription subscription = UserSubscription.builder()
                .customer(customer)
                .plan(plan)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusDays(plan.getDurationDays()))
                .status(SubscriptionStatus.PENDING)
                .build();
        UserSubscription savedSubscription = userSubscriptionRepository.save(subscription);

        // 2. Tạo đơn hàng gửi PayOS
        Long orderCode = System.currentTimeMillis();
        long amount = plan.getPrice().longValue();

        // Giới hạn độ dài mô tả của PayOS (tối đa 25 ký tự)
        String description = "Mua gói " + plan.getTier();
        if (description.length() > 25) {
            description = description.substring(0, 25);
        }

        PaymentLinkItem item = PaymentLinkItem.builder()
                .name("Goi " + plan.getTier())
                .quantity(1)
                .price(amount)
                .build();

        // Tính thời điểm hết hạn theo Unix timestamp (giây)
        long expiredAt = Instant.now().plusSeconds((long) expiryMinutes * 60).getEpochSecond();

        CreatePaymentLinkRequest request = CreatePaymentLinkRequest.builder()
                .orderCode(orderCode)
                .amount(amount)
                .description(description)
                .items(List.of(item))
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .expiredAt(expiredAt)
                .build();

        try {
            CreatePaymentLinkResponse payosResponse = payOS.paymentRequests().create(request);

            // 3. Lưu thông tin Payment ở trạng thái PENDING
            Payment payment = Payment.builder()
                    .customer(customer)
                    .subscription(savedSubscription)
                    .plan(plan)
                    .amount(plan.getPrice())
                    .currency("VND")
                    .paymentMethod(PaymentMethod.PAYOS)
                    .status(PaymentStatus.PENDING)
                    .orderCode(orderCode)
                    .checkoutUrl(payosResponse.getCheckoutUrl())
                    .isActive(true)
                    .build();
            paymentRepository.save(payment);

            log.info("Created PayOS payment for plan {} and user {}, orderCode {}", planId, email, orderCode);

            return PayOSResponse.builder()
                    .checkoutUrl(payosResponse.getCheckoutUrl())
                    .orderCode(orderCode)
                    .amount(plan.getPrice())
                    .status(PaymentStatus.PENDING.name())
                    .planTier(plan.getTier().name())
                    .build();

        } catch (Exception e) {
            log.error("Failed to create PayOS payment link", e);
            throw new BadRequestException("Không thể tạo liên kết thanh toán từ cổng PayOS");
        }
    }

    @Override
    @Transactional
    public void handleWebhook(PayOSWebhookRequest webhookBody) {
        if (webhookBody.getData() == null || webhookBody.getData().getOrderCode() == null) {
            log.warn("PayOS Webhook received with missing data/orderCode: {}", webhookBody);
            return;
        }

        Long orderCode = webhookBody.getData().getOrderCode();
        Payment payment = paymentRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch thanh toán cho mã đơn hàng " + orderCode));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            log.info("Payment for orderCode {} already processed with status: {}", orderCode, payment.getStatus());
            return;
        }

        if ("00".equals(webhookBody.getCode())) {
            processPaymentSuccess(payment, webhookBody.getSignature());
        } else {
            processPaymentFailure(payment);
        }
    }

    @Override
    @Transactional
    public PayOSResponse syncPaymentStatus(Long orderCode) {
        Payment payment = paymentRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch thanh toán cho mã đơn hàng " + orderCode));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            return PayOSResponse.builder()
                    .checkoutUrl(payment.getCheckoutUrl())
                    .orderCode(orderCode)
                    .amount(payment.getAmount())
                    .status(payment.getStatus().name())
                    .planTier(payment.getPlan().getTier().name())
                    .build();
        }

        try {
            PaymentLink payosDetails = payOS.paymentRequests().get(orderCode);
            String payosStatus = payosDetails.getStatus().getValue();

            log.info("PayOS sync status for orderCode {}: {}", orderCode, payosStatus);

            if ("PAID".equalsIgnoreCase(payosStatus)) {
                processPaymentSuccess(payment, "SYNCED_DIRECTLY");
            } else if ("CANCELLED".equalsIgnoreCase(payosStatus) || "EXPIRED".equalsIgnoreCase(payosStatus)) {
                processPaymentFailure(payment);
            }
        } catch (Exception e) {
            log.error("Failed to sync from PayOS for orderCode " + orderCode, e);
            throw new BadRequestException("Không thể đồng bộ trạng thái thanh toán từ PayOS");
        }

        return PayOSResponse.builder()
                .checkoutUrl(payment.getCheckoutUrl())
                .orderCode(orderCode)
                .amount(payment.getAmount())
                .status(payment.getStatus().name())
                .planTier(payment.getPlan().getTier().name())
                .build();
    }

    private void processPaymentSuccess(Payment payment, String signature) {
        // 1. Cập nhật trạng thái Payment sang SUCCESS
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setTransactionId("PAYOS-" + payment.getOrderCode());
        payment.setPaidAt(LocalDateTime.now());
        payment.setGatewayResponse("{\"signature\":\"" + signature + "\"}");
        paymentRepository.save(payment);

        // 2. Kích hoạt UserSubscription liên kết sang ACTIVE
        UserSubscription subscription = payment.getSubscription();
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(LocalDateTime.now().plusDays(payment.getPlan().getDurationDays()));
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        userSubscriptionRepository.save(subscription);

        log.info("Payment SUCCESS: Activated subscription tier {} for customer {}", 
                payment.getPlan().getTier(), payment.getCustomer().getId());
    }

    private void processPaymentFailure(Payment payment) {
        // 1. Cập nhật trạng thái Payment sang FAILED
        payment.setStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);

        // 2. Hủy gói UserSubscription (chuyển sang CANCELLED)
        UserSubscription subscription = payment.getSubscription();
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        userSubscriptionRepository.save(subscription);

        log.info("Payment FAILED/CANCELLED: Cancelled pending subscription tier {} for customer {}", 
                payment.getPlan().getTier(), payment.getCustomer().getId());
    }
}
