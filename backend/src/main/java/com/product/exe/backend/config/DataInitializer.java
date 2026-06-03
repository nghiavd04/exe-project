package com.product.exe.backend.config;

import com.product.exe.backend.entity.SubscriptionPlan;
import com.product.exe.backend.enums.SubscriptionTier;
import com.product.exe.backend.repository.SubscriptionPlanRepository;
import com.product.exe.backend.repository.ProgramPhaseMetadataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final ProgramPhaseMetadataRepository programPhaseMetadataRepository;
    private final DataSource dataSource;

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

        if (programPhaseMetadataRepository.count() == 0) {
            log.info("Initializing Dopamine Detox Program metadata from dml_program_metadata.sql...");
            try {
                ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
                        false, false, "UTF-8", new ClassPathResource("dml_program_metadata.sql")
                );
                populator.execute(dataSource);
                log.info("Program metadata initialized successfully.");
            } catch (Exception e) {
                log.error("Failed to initialize Program metadata: ", e);
            }
        } else {
            log.info("Program metadata already exists. Skipping initialization.");
        }
    }
}

