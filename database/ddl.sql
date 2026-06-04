SET NAMES utf8mb4;
SET time_zone = '+00:00';

DROP DATABASE IF EXISTS `exe_db`;
CREATE DATABASE `exe_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `exe_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
    provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
    provider_id VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    avatar_public_id VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    avatar_public_id VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Articles Table
CREATE TABLE IF NOT EXISTS articles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    admin_id BIGINT,
    category ENUM('HEALTH', 'SCIENCE', 'LIFESTYLE', 'EDUCATION', 'PSYCHOLOGY', 'TECHNOLOGY') NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    thumbnail_url TEXT,
    thumbnail_public_id VARCHAR(255),
    required_tier VARCHAR(50) NOT NULL DEFAULT 'FREE',
    status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    view_count BIGINT NOT NULL DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

-- 5. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    admin_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    overall_assessment TEXT,
    image_url TEXT,
    image_public_id VARCHAR(255),
    status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- 6. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quiz_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    type ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE') NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 7. Answers Table
CREATE TABLE IF NOT EXISTS answers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    value VARCHAR(100) NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 8. Quiz Assessment Rules Table
CREATE TABLE IF NOT EXISTS quiz_assessment_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quiz_id BIGINT NOT NULL,
    min_score INT NOT NULL,
    max_score INT NOT NULL,
    result_text TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 9. Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_days INT NOT NULL,
    description TEXT,
    features TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    tier VARCHAR(50) NOT NULL DEFAULT 'FREE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    status ENUM('IN_PROGRESS', 'COMPLETED', 'EXPIRED') NOT NULL DEFAULT 'IN_PROGRESS',
    total_score INT,
    assessment_result TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMP NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 11. User Answers Table
CREATE TABLE IF NOT EXISTS user_answers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    answer_id BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE SET NULL
);

-- 12. User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status ENUM('ACTIVE', 'EXPIRED', 'CANCELLED') NOT NULL,
    tier VARCHAR(50) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
);

-- 13. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    subscription_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    payment_method ENUM('PAYOS') NOT NULL,
    status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(255),
    gateway_response JSON,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
);

-- 14. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    reply_message TEXT,
    replied_at TIMESTAMP NULL,
    replied_by_admin_id BIGINT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (replied_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 15. Email Verifications Table
CREATE TABLE IF NOT EXISTS email_verifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE
);

-- 16. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 17. User Notification Reads Table
CREATE TABLE IF NOT EXISTS user_notification_reads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    notification_id BIGINT NOT NULL,
    read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_notification (user_id, notification_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
);

-- 18. Program Phases Table (Metadata)
CREATE TABLE IF NOT EXISTS program_phases (
    phase_number INT PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    range_text VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    focus TEXT NOT NULL,
    science TEXT NOT NULL
);

-- 19. Program Weeks Table (Metadata)
CREATE TABLE IF NOT EXISTS program_weeks (
    week_number INT PRIMARY KEY,
    phase_number INT NOT NULL,
    label VARCHAR(255) NOT NULL,
    range_text VARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (phase_number) REFERENCES program_phases(phase_number) ON DELETE CASCADE
);

-- 20. Program Days Table (Metadata)
CREATE TABLE IF NOT EXISTS program_days (
    day_number INT PRIMARY KEY,
    week_number INT NOT NULL,
    label VARCHAR(255) NOT NULL,
    FOREIGN KEY (week_number) REFERENCES program_weeks(week_number) ON DELETE CASCADE
);

-- 21. Program Tasks Metadata Table (Metadata)
CREATE TABLE IF NOT EXISTS program_tasks_metadata (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    phase_number INT NOT NULL,
    week_number INT NOT NULL,
    day_number INT NULL,
    task_index INT NOT NULL,
    title TEXT NOT NULL,
    sub_text TEXT,
    badge VARCHAR(50),
    FOREIGN KEY (phase_number) REFERENCES program_phases(phase_number) ON DELETE CASCADE,
    FOREIGN KEY (week_number) REFERENCES program_weeks(week_number) ON DELETE CASCADE,
    FOREIGN KEY (day_number) REFERENCES program_days(day_number) ON DELETE CASCADE
);

-- 22. Program Metrics Metadata Table (Metadata)
CREATE TABLE IF NOT EXISTS program_metrics_metadata (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    phase_number INT NOT NULL,
    week_number INT NOT NULL,
    day_number INT NULL,
    metric_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (phase_number) REFERENCES program_phases(phase_number) ON DELETE CASCADE,
    FOREIGN KEY (week_number) REFERENCES program_weeks(week_number) ON DELETE CASCADE,
    FOREIGN KEY (day_number) REFERENCES program_days(day_number) ON DELETE CASCADE
);

-- 23. User Program Progress Table
CREATE TABLE IF NOT EXISTS user_program_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT UNIQUE NOT NULL,
    current_day INT NOT NULL DEFAULT 1,
    streak_count INT NOT NULL DEFAULT 0,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_checked_in_at TIMESTAMP NULL,
    status ENUM('ACTIVE', 'COMPLETED', 'PAUSED') NOT NULL DEFAULT 'ACTIVE',
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 24. User Program Tasks Table
CREATE TABLE IF NOT EXISTS user_program_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    day_number INT NULL, -- NULL for weekly tasks (Weeks 5-16)
    week_number INT NOT NULL,
    task_index INT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    UNIQUE KEY unique_user_day_task (customer_id, day_number, week_number, task_index),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 25. User Daily Logs Table (For Month 1: Days 1-30)
CREATE TABLE IF NOT EXISTS user_daily_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    day_number INT NOT NULL,
    screen_time_minutes INT NULL,
    unconscious_open_count INT NULL,
    urge_level INT NULL,
    sleep_hours DECIMAL(4,2) NULL,
    mood_score INT NULL,
    sleep_score INT NULL,
    urge_score INT NULL,
    focus_score INT NULL,
    journal_text TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_daily_log (customer_id, day_number),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 26. User Weekly Logs Table (For Months 2-4: Weeks 5-16)
CREATE TABLE IF NOT EXISTS user_weekly_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    week_number INT NOT NULL,
    screen_time_avg_minutes INT NULL,
    mood_avg_score INT NULL,
    deep_work_avg_minutes INT NULL,
    output_count INT NULL,
    social_media_avg_minutes INT NULL,
    streak_count INT NULL,
    relationship_satisfaction INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_weekly_log (customer_id, week_number),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

