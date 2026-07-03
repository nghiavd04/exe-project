package com.product.exe.backend.config;

import com.product.exe.backend.entity.SubscriptionPlan;
import com.product.exe.backend.enums.SubscriptionTier;
import com.product.exe.backend.repository.SubscriptionPlanRepository;
import com.product.exe.backend.repository.ProtocolRepository;
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

        if (protocolRepository.count() == 0) {
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

        // Seed tasks and metrics if table is empty
        long taskCount = getTaskMetadataCount();
        if (taskCount == 0) {
            log.info("program_tasks_metadata table is empty! Seeding tasks and metrics...");
            seedTasksAndMetricsFromOldSql();
            seedTasksAndMetricsFromMarkdown("phacdo_nhe_21ngay.md", 1L);
            seedTasksAndMetricsFromMarkdown("phacdo_trungbinh_45ngay.md", 2L);
            seedTasksAndMetricsFromMarkdown("phacdo_nang_90ngay.md", 3L);
        }
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

    private void seedTasksAndMetricsFromOldSql() {
        try (java.io.InputStream is = new ClassPathResource("dml_program_metadata_old.sql").getInputStream();
             java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(is, java.nio.charset.StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.startsWith("INSERT INTO program_tasks_metadata ")) {
                    parseAndInsertOldTask(line);
                } else if (line.startsWith("INSERT INTO program_metrics_metadata ")) {
                    parseAndInsertOldMetric(line);
                }
            }
            log.info("Seeded Protocol 4 tasks and metrics from dml_program_metadata_old.sql successfully.");
        } catch (Exception e) {
            log.error("Failed to seed Protocol 4 metadata: ", e);
        }
    }

    private void parseAndInsertOldTask(String line) {
        try {
            int valuesIdx = line.indexOf("VALUES");
            if (valuesIdx == -1) return;
            String valuesPart = line.substring(valuesIdx + 6).trim();
            if (valuesPart.startsWith("(")) {
                valuesPart = valuesPart.substring(1);
            }
            if (valuesPart.endsWith(");")) {
                valuesPart = valuesPart.substring(0, valuesPart.length() - 2);
            } else if (valuesPart.endsWith(")")) {
                valuesPart = valuesPart.substring(0, valuesPart.length() - 1);
            }
            
            int comma1 = valuesPart.indexOf(',');
            int comma2 = valuesPart.indexOf(',', comma1 + 1);
            int comma3 = valuesPart.indexOf(',', comma2 + 1);
            int comma4 = valuesPart.indexOf(',', comma3 + 1);
            
            String phaseStr = valuesPart.substring(0, comma1).trim();
            String weekStr = valuesPart.substring(comma1 + 1, comma2).trim();
            String dayStr = valuesPart.substring(comma2 + 1, comma3).trim();
            String indexStr = valuesPart.substring(comma3 + 1, comma4).trim();
            String titleStr = valuesPart.substring(comma4 + 1).trim();
            
            if (titleStr.startsWith("'")) {
                titleStr = titleStr.substring(1);
            }
            if (titleStr.endsWith("'")) {
                titleStr = titleStr.substring(0, titleStr.length() - 1);
            }
            titleStr = titleStr.replace("''", "'");
            
            Integer phaseNum = Integer.parseInt(phaseStr);
            Integer weekNum = Integer.parseInt(weekStr);
            Integer dayNum = "NULL".equalsIgnoreCase(dayStr) ? null : Integer.parseInt(dayStr);
            Integer taskIdx = Integer.parseInt(indexStr);
            
            insertTaskIntoDb(4L, phaseNum, weekNum, dayNum, taskIdx, titleStr);
        } catch (Exception e) {
            log.error("Failed to parse old task line: " + line, e);
        }
    }

    private void parseAndInsertOldMetric(String line) {
        try {
            int valuesIdx = line.indexOf("VALUES");
            if (valuesIdx == -1) return;
            String valuesPart = line.substring(valuesIdx + 6).trim();
            if (valuesPart.startsWith("(")) {
                valuesPart = valuesPart.substring(1);
            }
            if (valuesPart.endsWith(");")) {
                valuesPart = valuesPart.substring(0, valuesPart.length() - 2);
            } else if (valuesPart.endsWith(")")) {
                valuesPart = valuesPart.substring(0, valuesPart.length() - 1);
            }
            
            int comma1 = valuesPart.indexOf(',');
            int comma2 = valuesPart.indexOf(',', comma1 + 1);
            int comma3 = valuesPart.indexOf(',', comma2 + 1);
            
            String phaseStr = valuesPart.substring(0, comma1).trim();
            String weekStr = valuesPart.substring(comma1 + 1, comma2).trim();
            String dayStr = valuesPart.substring(comma2 + 1, comma3).trim();
            String metricStr = valuesPart.substring(comma3 + 1).trim();
            
            if (metricStr.startsWith("'")) {
                metricStr = metricStr.substring(1);
            }
            if (metricStr.endsWith("'")) {
                metricStr = metricStr.substring(0, metricStr.length() - 1);
            }
            metricStr = metricStr.replace("''", "'");
            
            Integer phaseNum = Integer.parseInt(phaseStr);
            Integer weekNum = Integer.parseInt(weekStr);
            Integer dayNum = "NULL".equalsIgnoreCase(dayStr) ? null : Integer.parseInt(dayStr);
            
            insertMetricIntoDb(4L, phaseNum, weekNum, dayNum, metricStr);
        } catch (Exception e) {
            log.error("Failed to parse old metric line: " + line, e);
        }
    }

    private void seedTasksAndMetricsFromMarkdown(String resourceName, Long protocolId) {
        try (java.io.InputStream is = new ClassPathResource(resourceName).getInputStream();
             java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(is, java.nio.charset.StandardCharsets.UTF_8))) {
            
            String line;
            Integer currentWeek = null;
            Integer currentDay = null;
            String state = "NONE";
            int taskIndex = 0;
            
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (trimmed.isEmpty()) continue;
                
                if (trimmed.toLowerCase().startsWith("## tuần ") || trimmed.toLowerCase().startsWith("# tuần ")) {
                    String lower = trimmed.toLowerCase();
                    int startIdx = lower.indexOf("tuần ") + 5;
                    int endIdx = startIdx;
                    while (endIdx < lower.length() && Character.isDigit(lower.charAt(endIdx))) {
                        endIdx++;
                    }
                    if (endIdx > startIdx) {
                        currentWeek = Integer.parseInt(lower.substring(startIdx, endIdx));
                        currentDay = null;
                        state = "NONE";
                    }
                    continue;
                }
                
                String lower = trimmed.toLowerCase();
                if (lower.startsWith("ngày ") || lower.startsWith("## ngày ") || lower.startsWith("### ngày ")) {
                    int startIdx = lower.indexOf("ngày ") + 5;
                    int endIdx = startIdx;
                    while (endIdx < lower.length() && Character.isDigit(lower.charAt(endIdx))) {
                        endIdx++;
                    }
                    if (endIdx > startIdx) {
                        currentDay = Integer.parseInt(lower.substring(startIdx, endIdx));
                        state = "NONE";
                    }
                    continue;
                }
                
                if (trimmed.equalsIgnoreCase("tasks:") || trimmed.equalsIgnoreCase("key tasks:") || trimmed.equalsIgnoreCase("weekly tasks:")) {
                    state = "TASKS";
                    taskIndex = 0;
                    continue;
                }
                if (trimmed.equalsIgnoreCase("daily tracking:") || trimmed.equalsIgnoreCase("weekly tracking:") || trimmed.equalsIgnoreCase("metrics:")) {
                    state = "METRICS";
                    continue;
                }
                
                if ("TASKS".equals(state)) {
                    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                        String title = trimmed.substring(2).trim();
                        if (!title.isEmpty()) {
                            insertTaskFromMarkdown(protocolId, currentWeek, currentDay, taskIndex++, title);
                        }
                    } else if (trimmed.endsWith(":") || trimmed.startsWith("#") || trimmed.startsWith("|")) {
                        state = "NONE";
                    }
                }
                
                if ("METRICS".equals(state)) {
                    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
                        String[] parts = trimmed.split("\\|");
                        if (parts.length >= 2) {
                            String metricName = parts[1].trim();
                            if (!metricName.isEmpty() && !metricName.equalsIgnoreCase("chỉ số") && !metricName.equalsIgnoreCase("metric") && !metricName.contains("---")) {
                                insertMetricFromMarkdown(protocolId, currentWeek, currentDay, metricName);
                            }
                        }
                    } else if (trimmed.endsWith(":") || trimmed.startsWith("#")) {
                        state = "NONE";
                    }
                }
            }
            log.info("Seeded tasks and metrics from {} successfully.", resourceName);
        } catch (Exception e) {
            log.error("Failed to seed from " + resourceName + ": ", e);
        }
    }

    private void insertTaskIntoDb(Long protocolId, Integer phaseNum, Integer weekNum, Integer dayNum, Integer taskIndex, String title) {
        String insertQuery = "INSERT INTO program_tasks_metadata (protocol_id, phase_id, week_id, day_id, task_index, title) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = dataSource.getConnection()) {
            Long phaseId = lookupPhaseId(conn, protocolId, phaseNum);
            Long weekId = lookupWeekId(conn, protocolId, weekNum);
            Long dayId = dayNum == null ? null : lookupDayId(conn, protocolId, dayNum);
            
            try (PreparedStatement stmt = conn.prepareStatement(insertQuery)) {
                stmt.setLong(1, protocolId);
                stmt.setLong(2, phaseId);
                stmt.setLong(3, weekId);
                if (dayId == null) {
                    stmt.setNull(4, java.sql.Types.BIGINT);
                } else {
                    stmt.setLong(4, dayId);
                }
                stmt.setInt(5, taskIndex);
                stmt.setString(6, title);
                stmt.executeUpdate();
            }
        } catch (Exception e) {
            log.error("Failed to insert task: protocolId={}, dayNum={}, index={}", protocolId, dayNum, taskIndex, e);
        }
    }

    private void insertMetricIntoDb(Long protocolId, Integer phaseNum, Integer weekNum, Integer dayNum, String metricName) {
        String insertQuery = "INSERT INTO program_metrics_metadata (protocol_id, phase_id, week_id, day_id, metric_name) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = dataSource.getConnection()) {
            Long phaseId = lookupPhaseId(conn, protocolId, phaseNum);
            Long weekId = lookupWeekId(conn, protocolId, weekNum);
            Long dayId = dayNum == null ? null : lookupDayId(conn, protocolId, dayNum);
            
            try (PreparedStatement stmt = conn.prepareStatement(insertQuery)) {
                stmt.setLong(1, protocolId);
                stmt.setLong(2, phaseId);
                stmt.setLong(3, weekId);
                if (dayId == null) {
                    stmt.setNull(4, java.sql.Types.BIGINT);
                } else {
                    stmt.setLong(4, dayId);
                }
                stmt.setString(5, metricName);
                stmt.executeUpdate();
            }
        } catch (Exception e) {
            log.error("Failed to insert metric: protocolId={}, dayNum={}, name={}", protocolId, dayNum, metricName, e);
        }
    }

    private void insertTaskFromMarkdown(Long protocolId, Integer weekNum, Integer dayNum, Integer taskIndex, String title) {
        String insertQuery = "INSERT INTO program_tasks_metadata (protocol_id, phase_id, week_id, day_id, task_index, title) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = dataSource.getConnection()) {
            Long dayId = null;
            Long weekId = null;
            Long phaseId = null;
            
            if (dayNum != null) {
                String dayQuery = "SELECT d.id, d.week_id, w.phase_id FROM program_days d " +
                        "JOIN program_weeks w ON d.week_id = w.id " +
                        "WHERE d.protocol_id = ? AND d.day_number = ?";
                try (PreparedStatement stmt = conn.prepareStatement(dayQuery)) {
                    stmt.setLong(1, protocolId);
                    stmt.setInt(2, dayNum);
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            dayId = rs.getLong("id");
                            weekId = rs.getLong("week_id");
                            phaseId = rs.getLong("phase_id");
                        }
                    }
                }
            } else if (weekNum != null) {
                String weekQuery = "SELECT id, phase_id FROM program_weeks WHERE protocol_id = ? AND week_number = ?";
                try (PreparedStatement stmt = conn.prepareStatement(weekQuery)) {
                    stmt.setLong(1, protocolId);
                    stmt.setInt(2, weekNum);
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            weekId = rs.getLong("id");
                            phaseId = rs.getLong("phase_id");
                        }
                    }
                }
            }
            
            if (weekId == null || phaseId == null) {
                return;
            }
            
            try (PreparedStatement stmt = conn.prepareStatement(insertQuery)) {
                stmt.setLong(1, protocolId);
                stmt.setLong(2, phaseId);
                stmt.setLong(3, weekId);
                if (dayId == null) {
                    stmt.setNull(4, java.sql.Types.BIGINT);
                } else {
                    stmt.setLong(4, dayId);
                }
                stmt.setInt(5, taskIndex);
                stmt.setString(6, title);
                stmt.executeUpdate();
            }
        } catch (Exception e) {
            log.error("Failed to insert markdown task: protocolId={}, dayNum={}, title={}", protocolId, dayNum, title, e);
        }
    }

    private void insertMetricFromMarkdown(Long protocolId, Integer weekNum, Integer dayNum, String metricName) {
        String insertQuery = "INSERT INTO program_metrics_metadata (protocol_id, phase_id, week_id, day_id, metric_name) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = dataSource.getConnection()) {
            Long dayId = null;
            Long weekId = null;
            Long phaseId = null;
            
            if (dayNum != null) {
                String dayQuery = "SELECT d.id, d.week_id, w.phase_id FROM program_days d " +
                        "JOIN program_weeks w ON d.week_id = w.id " +
                        "WHERE d.protocol_id = ? AND d.day_number = ?";
                try (PreparedStatement stmt = conn.prepareStatement(dayQuery)) {
                    stmt.setLong(1, protocolId);
                    stmt.setInt(2, dayNum);
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            dayId = rs.getLong("id");
                            weekId = rs.getLong("week_id");
                            phaseId = rs.getLong("phase_id");
                        }
                    }
                }
            } else if (weekNum != null) {
                String weekQuery = "SELECT id, phase_id FROM program_weeks WHERE protocol_id = ? AND week_number = ?";
                try (PreparedStatement stmt = conn.prepareStatement(weekQuery)) {
                    stmt.setLong(1, protocolId);
                    stmt.setInt(2, weekNum);
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            weekId = rs.getLong("id");
                            phaseId = rs.getLong("phase_id");
                        }
                    }
                }
            }
            
            if (weekId == null || phaseId == null) {
                return;
            }
            
            try (PreparedStatement stmt = conn.prepareStatement(insertQuery)) {
                stmt.setLong(1, protocolId);
                stmt.setLong(2, phaseId);
                stmt.setLong(3, weekId);
                if (dayId == null) {
                    stmt.setNull(4, java.sql.Types.BIGINT);
                } else {
                    stmt.setLong(4, dayId);
                }
                stmt.setString(5, metricName);
                stmt.executeUpdate();
            }
        } catch (Exception e) {
            log.error("Failed to insert markdown metric: protocolId={}, dayNum={}, name={}", protocolId, dayNum, metricName, e);
        }
    }

    private Long lookupPhaseId(Connection conn, Long protocolId, Integer phaseNum) throws Exception {
        String query = "SELECT id FROM program_phases WHERE protocol_id = ? AND phase_number = ?";
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setLong(1, protocolId);
            stmt.setInt(2, phaseNum);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong("id");
                }
            }
        }
        throw new RuntimeException("Phase not found: protocol=" + protocolId + ", num=" + phaseNum);
    }

    private Long lookupWeekId(Connection conn, Long protocolId, Integer weekNum) throws Exception {
        String query = "SELECT id FROM program_weeks WHERE protocol_id = ? AND week_number = ?";
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setLong(1, protocolId);
            stmt.setInt(2, weekNum);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong("id");
                }
            }
        }
        throw new RuntimeException("Week not found: protocol=" + protocolId + ", num=" + weekNum);
    }

    private Long lookupDayId(Connection conn, Long protocolId, Integer dayNum) throws Exception {
        String query = "SELECT id FROM program_days WHERE protocol_id = ? AND day_number = ?";
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setLong(1, protocolId);
            stmt.setInt(2, dayNum);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong("id");
                }
            }
        }
        throw new RuntimeException("Day not found: protocol=" + protocolId + ", num=" + dayNum);
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

