USE `exe_db`;

-- --------------------------------------------------------
-- 1. Users & Profiles
-- Passwords are set to "password" ($2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIvi)
-- --------------------------------------------------------
INSERT INTO users (email, password, role, is_active, created_at, updated_at) VALUES 
('admin@dopaless.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIvi', 'ADMIN', TRUE, NOW(), NOW()),
('user@dopaless.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIvi', 'CUSTOMER', TRUE, NOW(), NOW());

INSERT INTO admins (user_id, full_name, is_active) VALUES 
(1, 'Admin Dopaless', TRUE);

INSERT INTO customers (user_id, full_name, is_active) VALUES 
(2, 'Người dùng thử nghiệm', TRUE);

-- --------------------------------------------------------
-- 2. Subscription Plans
-- --------------------------------------------------------
INSERT INTO subscription_plans (name, price, duration_days, description, is_active, tier, created_at) VALUES
('Gói Miễn Phí', 0, 3650, 'Truy cập các nội dung cơ bản của Dopaless.', TRUE, 'FREE', NOW()),
('Gói Thành Viên VIP', 49000, 30, 'Mở khóa các bài viết chuyên sâu cấp độ VIP.', TRUE, 'VIP', NOW()),
('Gói Hội Viên Premium', 99000, 30, 'Toàn quyền truy cập mọi nội dung cao cấp nhất và tài liệu đặc biệt.', TRUE, 'PREMIUM', NOW());

-- --------------------------------------------------------
-- 3. Articles (Tin tức & Kiến thức)
-- --------------------------------------------------------
INSERT INTO articles (admin_id, category, title, slug, content, thumbnail_url, required_tier, status, published_at, is_active, created_at, updated_at, view_count) VALUES
(1, 'SCIENCE', 'Dopamine là gì và tại sao bộ não lại luôn thèm muốn nó?', 'dopamine-la-gi', '<p>Dopamine thường bị hiểu lầm là "hormone hạnh phúc". Thực chất, nó là chất dẫn truyền thần kinh của sự mong đợi (anticipation) và thèm khát (craving).</p>', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80', 'FREE', 'PUBLISHED', NOW(), TRUE, NOW(), NOW(), 150),
(1, 'PSYCHOLOGY', 'Cơ chế phần thưởng biến thiên: Bí mật sau cơn nghiện TikTok', 'phan-thuong-bien-thien-nghien-tiktok', '<p>Tại sao bạn có thể lướt TikTok hàng giờ mà không chán? Câu trả lời nằm ở "Variable Reward" (Phần thưởng biến thiên).</p>', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80', 'VIP', 'PUBLISHED', NOW(), TRUE, NOW(), NOW(), 85),
(1, 'HEALTH', 'Dopamine Fasting 2.0: Hướng dẫn chuyên sâu cho người làm việc trí óc', 'dopamine-fasting-2-0', '<p>Đây là tài liệu chuyên sâu dành cho hội viên Premium về cách quản lý baseline dopamine.</p>', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80', 'PREMIUM', 'PUBLISHED', NOW(), TRUE, NOW(), NOW(), 42);

-- --------------------------------------------------------
-- 4. Quizzes
-- --------------------------------------------------------
INSERT INTO quizzes (admin_id, title, description, overall_assessment, status, is_active, created_at, updated_at, image_url) VALUES
(1, 'Đánh giá mức độ lệ thuộc Smartphone', 'Bài test nhanh giúp bạn đánh giá mức độ lệ thuộc vào smartphone.', 'Kết quả phản ánh mức độ gắn bó của bạn với thiết bị di động.', 'PUBLISHED', TRUE, NOW(), NOW(), 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80'),
(1, 'Kiểm tra khả năng tập trung (Deep Work)', 'Bạn có thể duy trì sự tập trung trong bao lâu?', 'Sự tập trung là yếu tố then chốt cho năng suất.', 'PUBLISHED', TRUE, NOW(), NOW(), 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80');

-- --------------------------------------------------------
-- 5. Questions & Answers (Quiz 1)
-- --------------------------------------------------------
INSERT INTO questions (quiz_id, content, type, order_index, is_active, created_at) VALUES
(1, 'Bạn dùng điện thoại bao nhiêu tiếng mỗi ngày?', 'SINGLE_CHOICE', 1, TRUE, NOW()),
(1, 'Bạn check thông báo bao nhiêu lần trong lúc làm việc?', 'SINGLE_CHOICE', 2, TRUE, NOW());

INSERT INTO answers (question_id, content, value, order_index, is_active) VALUES
(1, 'Dưới 1 tiếng', '0', 1, TRUE),
(1, '1-3 tiếng', '5', 2, TRUE),
(1, '3-5 tiếng', '10', 3, TRUE),
(1, 'Trên 5 tiếng', '15', 4, TRUE),
(2, 'Không bao giờ', '0', 1, TRUE),
(2, 'Thỉnh thoảng', '5', 2, TRUE),
(2, 'Liên tục', '15', 3, TRUE);

-- --------------------------------------------------------
-- 6. Quiz Assessment Rules (Quiz 1)
-- --------------------------------------------------------
INSERT INTO quiz_assessment_rules (quiz_id, min_score, max_score, result_text, is_active) VALUES
(1, 0, 10, 'Bạn có khả năng tự chủ công nghệ rất tốt. Hãy tiếp tục duy trì thói quen này!', TRUE),
(1, 11, 20, 'Bạn đang ở mức độ trung bình. Hãy thử áp dụng quy tắc "không điện thoại 1 giờ trước khi ngủ".', TRUE),
(1, 21, 30, 'Mức độ lệ thuộc cao! Bạn nên thực hiện một đợt "Dopamine Detox" để cân bằng lại.', TRUE);

-- --------------------------------------------------------
-- 7. Sample Quiz Attempt
-- --------------------------------------------------------
INSERT INTO quiz_attempts (customer_id, quiz_id, status, total_score, assessment_result, started_at, submitted_at, version) VALUES
(1, 1, 'COMPLETED', 25, 'Mức độ lệ thuộc cao! Bạn nên thực hiện một đợt "Dopamine Detox" để cân bằng lại.', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 50 MINUTE), 1);

INSERT INTO user_answers (attempt_id, question_id, answer_id) VALUES
(1, 1, 3), -- 10 points
(1, 2, 7); -- 15 points

-- --------------------------------------------------------
-- 8. Subscription Data
-- --------------------------------------------------------
INSERT INTO user_subscriptions (customer_id, plan_id, started_at, expires_at, is_active) VALUES
(1, 2, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE);
