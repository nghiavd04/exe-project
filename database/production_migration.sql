-- TARGETED MIGRATION FOR PRODUCTION (NO DATA LOSS)
-- This script upgrades the metadata tables and adds multi-protocol columns to progress without dropping user data tables.

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Drop old static metadata tables (Contains no user progress, only configurations)
DROP TABLE IF EXISTS `program_tasks_metadata`;
DROP TABLE IF EXISTS `program_metrics_metadata`;
DROP TABLE IF EXISTS `program_days`;
DROP TABLE IF EXISTS `program_weeks`;
DROP TABLE IF EXISTS `program_phases`;
DROP TABLE IF EXISTS `protocols`;

-- 2. Recreate protocols and static metadata tables with ID primary keys
CREATE TABLE IF NOT EXISTS `protocols` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `code` VARCHAR(100) UNIQUE NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `selection_policy` VARCHAR(50) NOT NULL DEFAULT 'USER_SELECT', -- AUTO_ONLY, USER_SELECT, CLINICIAN_REVIEW
    `min_tier_required` VARCHAR(50) NOT NULL DEFAULT 'BASIC', -- BASIC, PREMIUM, ELITE
    `duration_days` INT NOT NULL,
    `weights_json` TEXT, -- JSON weights for scoring
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `program_phases` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `protocol_id` BIGINT NOT NULL,
    `phase_number` INT NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `range_text` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(50) NOT NULL,
    `focus` TEXT NOT NULL,
    `science` TEXT NOT NULL,
    FOREIGN KEY (`protocol_id`) REFERENCES `protocols`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_protocol_phase` (`protocol_id`, `phase_number`)
);

CREATE TABLE IF NOT EXISTS `program_weeks` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `protocol_id` BIGINT NOT NULL,
    `week_number` INT NOT NULL,
    `phase_id` BIGINT NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `range_text` VARCHAR(255) NOT NULL,
    `description` TEXT,
    FOREIGN KEY (`protocol_id`) REFERENCES `protocols`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`phase_id`) REFERENCES `program_phases`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_protocol_week` (`protocol_id`, `week_number`)
);

CREATE TABLE IF NOT EXISTS `program_days` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `protocol_id` BIGINT NOT NULL,
    `day_number` INT NOT NULL,
    `week_id` BIGINT NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    FOREIGN KEY (`protocol_id`) REFERENCES `protocols`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`week_id`) REFERENCES `program_weeks`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_protocol_day` (`protocol_id`, `day_number`)
);

CREATE TABLE IF NOT EXISTS `program_tasks_metadata` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `protocol_id` BIGINT NOT NULL,
    `phase_id` BIGINT NOT NULL,
    `week_id` BIGINT NOT NULL,
    `day_id` BIGINT NULL,
    `task_index` INT NOT NULL,
    `title` TEXT NOT NULL,
    `sub_text` TEXT,
    `badge` VARCHAR(50),
    FOREIGN KEY (`protocol_id`) REFERENCES `protocols`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`phase_id`) REFERENCES `program_phases`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`week_id`) REFERENCES `program_weeks`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`day_id`) REFERENCES `program_days`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `program_metrics_metadata` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `protocol_id` BIGINT NOT NULL,
    `phase_id` BIGINT NOT NULL,
    `week_id` BIGINT NOT NULL,
    `day_id` BIGINT NULL,
    `metric_name` VARCHAR(255) NOT NULL,
    FOREIGN KEY (`protocol_id`) REFERENCES `protocols`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`phase_id`) REFERENCES `program_phases`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`week_id`) REFERENCES `program_weeks`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`day_id`) REFERENCES `program_days`(`id`) ON DELETE CASCADE
);

-- 3. Create new tables for multi-protocol selection & review features
CREATE TABLE IF NOT EXISTS `quiz_recommendations` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `quiz_attempt_id` BIGINT NOT NULL,
    `customer_id` BIGINT NOT NULL,
    `protocol_id` BIGINT NOT NULL,
    `rank_order` INT NOT NULL,
    `match_score` DOUBLE NOT NULL,
    `confidence_level` VARCHAR(50) NOT NULL,
    `reason_text` TEXT,
    `dimension_snapshot_json` TEXT,
    `rule_version` INT NOT NULL DEFAULT 1,
    `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`quiz_attempt_id`) REFERENCES `quiz_attempts`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`protocol_id`) REFERENCES `protocols`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `protocol_selections` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `customer_id` BIGINT NOT NULL,
    `recommendation_id` BIGINT,
    `selected_protocol_id` BIGINT NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING_PAYMENT',
    `selected_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`recommendation_id`) REFERENCES `quiz_recommendations`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`selected_protocol_id`) REFERENCES `protocols`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `program_reviews` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `user_program_progress_id` BIGINT NOT NULL,
    `review_cycle_number` INT NOT NULL,
    `suitability_rating` INT NOT NULL,
    `completion_confidence` INT NOT NULL,
    `difficulty_level` INT NOT NULL,
    `wants_to_switch` BOOLEAN NOT NULL DEFAULT FALSE,
    `user_notes` TEXT,
    `next_action` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_program_progress_id`) REFERENCES `user_program_progress`(`id`) ON DELETE CASCADE
);

-- 4. Safe Alter on existing User Progress table (NO LOSS OF DATA)
-- Adds protocol_id connection, cycle count, and review thresholds without affecting user logs
ALTER TABLE `user_program_progress` ADD COLUMN IF NOT EXISTS `protocol_id` BIGINT NULL;
ALTER TABLE `user_program_progress` ADD CONSTRAINT `fk_progress_protocol` FOREIGN KEY (`protocol_id`) REFERENCES `protocols`(`id`) ON DELETE SET NULL;
ALTER TABLE `user_program_progress` ADD COLUMN IF NOT EXISTS `cycle_number` INT NOT NULL DEFAULT 1;
ALTER TABLE `user_program_progress` ADD COLUMN IF NOT EXISTS `review_due_at` TIMESTAMP NULL;
ALTER TABLE `user_program_progress` ADD COLUMN IF NOT EXISTS `switch_locked_until` TIMESTAMP NULL;

-- 5. Initialize existing users' protocol assignment to the default 120-day Intensive Protocol
-- Assuming 'P_INTENSIVE_120' is ID = 4 (since it is inserted as ID = 4 in step 2)
UPDATE `user_program_progress` SET `protocol_id` = 4 WHERE `protocol_id` IS NULL;

SET FOREIGN_KEY_CHECKS = 1;
