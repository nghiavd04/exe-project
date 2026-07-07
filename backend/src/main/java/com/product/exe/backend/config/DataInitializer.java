package com.product.exe.backend.config;

import com.product.exe.backend.entity.SubscriptionPlan;
import com.product.exe.backend.enums.SubscriptionTier;
import com.product.exe.backend.repository.ProtocolRepository;
import com.product.exe.backend.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final ProtocolRepository protocolRepository;
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

        long daysCount = getDaysMetadataCount();
        long weeksCount = getWeeksMetadataCount();
        long taskCount = getTaskMetadataCount();
        long metricCount = getMetricMetadataCount();

        // Force re-seed once to clean up database state
        if (true || daysCount != 276 || weeksCount != 37 || taskCount != 462 || metricCount != 464) {
            log.info("Program metadata is incomplete or outdated (days: {}, weeks: {}, tasks: {}, metrics: {}). Re-initializing from dml_program_metadata.sql...", daysCount, weeksCount, taskCount, metricCount);
            try {
                executeMetadataScript();
                log.info("Program metadata initialized successfully. Current counts - Days: {}, Weeks: {}, Tasks: {}, Metrics: {}",
                        getDaysMetadataCount(), getWeeksMetadataCount(), getTaskMetadataCount(), getMetricMetadataCount());
            } catch (Exception e) {
                log.error("Failed to initialize Program metadata: ", e);
            }
        } else {
            log.info("Program metadata is up-to-date (days: {}, weeks: {}, tasks: {}, metrics: {}). Skipping initialization.", daysCount, weeksCount, taskCount, metricCount);
        }
    }

    private void executeMetadataScript() throws Exception {
        ClassPathResource resource = new ClassPathResource("dml_program_metadata.sql");
        String script;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder content = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line).append('\n');
            }
            script = content.toString();
        }

        if (!script.isEmpty() && script.charAt(0) == '﻿') {
            script = script.substring(1);
        }

        List<String> statements = splitSqlStatements(script);
        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            for (int i = 0; i < statements.size(); i++) {
                String sql = statements.get(i);
                try {
                    stmt.execute(sql);
                } catch (SQLException ex) {
                    log.error("Program metadata script failed at statement #{}: {}", i + 1, abbreviateSql(sql), ex);
                    throw ex;
                }
            }
        }
    }

    private List<String> splitSqlStatements(String script) {
        List<String> statements = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inSingleQuote = false;

        for (int i = 0; i < script.length(); i++) {
            char c = script.charAt(i);

            if (!inSingleQuote && c == '-' && i + 1 < script.length() && script.charAt(i + 1) == '-') {
                int prev = i - 1;
                while (prev >= 0 && (script.charAt(prev) == ' ' || script.charAt(prev) == '\t')) {
                    prev--;
                }
                if (prev < 0 || script.charAt(prev) == '\n' || script.charAt(prev) == '\r') {
                    while (i < script.length() && script.charAt(i) != '\n') {
                        i++;
                    }
                    continue;
                }
            }

            if (c == '\'' && (i == 0 || script.charAt(i - 1) != '\\')) {
                inSingleQuote = !inSingleQuote;
            }

            if (c == ';' && !inSingleQuote) {
                String statement = current.toString().trim();
                if (!statement.isEmpty()) {
                    statements.add(statement);
                }
                current.setLength(0);
                continue;
            }

            current.append(c);
        }

        String tail = current.toString().trim();
        if (!tail.isEmpty()) {
            statements.add(tail);
        }
        return statements;
    }

    private String abbreviateSql(String sql) {
        String oneLine = sql.replace('\n', ' ').replace('\r', ' ').trim();
        return oneLine.length() > 300 ? oneLine.substring(0, 300) + "..." : oneLine;
    }

    private long getDaysMetadataCount() {
        String query = "SELECT COUNT(*) FROM program_days";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                return rs.getLong(1);
            }
        } catch (Exception e) {
            log.error("Failed to count program days: " + e.getMessage());
        }
        return 0;
    }

    private long getWeeksMetadataCount() {
        String query = "SELECT COUNT(*) FROM program_weeks";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                return rs.getLong(1);
            }
        } catch (Exception e) {
            log.error("Failed to count program weeks: " + e.getMessage());
        }
        return 0;
    }

    private long getTaskMetadataCount() {
        String query = "SELECT COUNT(*) FROM program_tasks_metadata";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                return rs.getLong(1);
            }
        } catch (Exception e) {
            log.error("Failed to count tasks: " + e.getMessage());
        }
        return 0;
    }

    private long getMetricMetadataCount() {
        String query = "SELECT COUNT(*) FROM program_metrics_metadata";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                return rs.getLong(1);
            }
        } catch (Exception e) {
            log.error("Failed to count metrics: " + e.getMessage());
        }
        return 0;
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
