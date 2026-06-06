package com.product.exe.backend.scheduler;

import com.product.exe.backend.entity.Payment;
import com.product.exe.backend.entity.UserSubscription;
import com.product.exe.backend.enums.PaymentStatus;
import com.product.exe.backend.repository.PaymentRepository;
import com.product.exe.backend.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentCleanupScheduler {

    private final PaymentRepository paymentRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;

    /**
     * Runs every day at 1:00 AM.
     * Deletes PENDING or FAILED payments that were created more than 24 hours ago,
     * along with their associated UserSubscription records.
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void cleanExpiredPayments() {
        log.info("Cron: Starting cleanup of expired pending/failed payments and subscriptions...");
        try {
            LocalDateTime threshold = LocalDateTime.now().minusHours(24);
            List<PaymentStatus> targetStatuses = List.of(PaymentStatus.PENDING, PaymentStatus.FAILED);

            // 1. Find all expired/failed payments
            List<Payment> expiredPayments = paymentRepository.findAllByStatusInAndCreatedAtBefore(targetStatuses, threshold);

            if (expiredPayments.isEmpty()) {
                log.info("Cron: No expired payments found to clean up.");
                return;
            }

            log.info("Cron: Found {} expired/failed payments to clean up.", expiredPayments.size());

            // 2. Extract associated user subscription IDs
            List<Long> subscriptionIds = expiredPayments.stream()
                    .map(Payment::getSubscription)
                    .filter(sub -> sub != null)
                    .map(UserSubscription::getId)
                    .distinct()
                    .collect(Collectors.toList());

            // 3. Delete payments first to avoid foreign key constraint violations
            paymentRepository.deleteAllInBatch(expiredPayments);
            log.info("Cron: Deleted {} expired/failed payment records.", expiredPayments.size());

            // 4. Delete the associated subscriptions
            if (!subscriptionIds.isEmpty()) {
                userSubscriptionRepository.deleteAllByIdInBatch(subscriptionIds);
                log.info("Cron: Deleted {} associated pending/cancelled user subscription records.", subscriptionIds.size());
            }

            log.info("Cron: Expired payment and subscription cleanup completed successfully.");
        } catch (Exception e) {
            log.error("Cron: Failed to execute expired payment cleanup: ", e);
        }
    }
}
