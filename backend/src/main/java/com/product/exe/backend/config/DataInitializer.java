package com.product.exe.backend.config;

import com.product.exe.backend.entity.SubscriptionPlan;
import com.product.exe.backend.enums.SubscriptionTier;
import com.product.exe.backend.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;


@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    public void run(String... args) throws Exception {

        if (!subscriptionPlanRepository.existsByTier(SubscriptionTier.FREE)) {
            log.info("Creating default FREE subscription plan...");
            SubscriptionPlan freePlan = SubscriptionPlan.builder()
                    .name("Gói Miễn Phí")
                    .price(BigDecimal.ZERO)
                    .durationDays(3650)
                    .description("Khám phá và trải nghiệm nền tảng. Làm bài test & đọc tin tức hoàn toàn miễn phí.")
                    .tier(SubscriptionTier.FREE)
                    .isActive(true)
                    .features("[{\"name\":\"Làm bài test đánh giá dopamine\",\"included\":true},{\"name\":\"Đọc tin tức miễn phí hoàn toàn\",\"included\":true},{\"name\":\"Tính năng nâng cấp (AI Coach, Lộ trình chuyên sâu,...)\",\"included\":false}]")
                    .build();
            subscriptionPlanRepository.save(freePlan);
            log.info("Default FREE subscription plan created successfully.");
        } else {
            log.info("FREE subscription plan already exists. Skipping initialization.");
        }
    }
}
