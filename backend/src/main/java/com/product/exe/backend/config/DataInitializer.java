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
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final ProgramPhaseMetadataRepository programPhaseMetadataRepository;
    private final DataSource dataSource;

    @Override
    public void run(String... args) throws Exception {
        // Safe dynamic drop of old metadata foreign keys from user logging tables
        dropForeignKeyIfExists("user_daily_logs", "day_number");
        dropForeignKeyIfExists("user_weekly_logs", "week_number");
        dropForeignKeyIfExists("user_program_tasks", "week_number");

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

    private void dropForeignKeyIfExists(String tableName, String columnName) {
        String query = "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
                "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? " +
                "AND REFERENCED_TABLE_NAME IS NOT NULL";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, tableName);
            stmt.setString(2, columnName);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String constraintName = rs.getString("CONSTRAINT_NAME");
                    log.info("Found foreign key constraint {} on table {} column {}. Dropping it...", constraintName, tableName, columnName);
                    try (Statement dropStmt = conn.createStatement()) {
                        dropStmt.executeUpdate("ALTER TABLE " + tableName + " DROP FOREIGN KEY " + constraintName);
                        log.info("Dropped foreign key constraint {} successfully.", constraintName);
                    } catch (Exception dropEx) {
                        log.error("Failed to drop foreign key constraint {}: {}", constraintName, dropEx.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Could not check/drop foreign key for table {} column {}: {}", tableName, columnName, e.getMessage());
        }
    }
}

