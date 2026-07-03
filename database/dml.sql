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
INSERT INTO subscription_plans (name, price, duration_days, description, features, is_active, tier, created_at) VALUES
('Gói Miễn Phí', 0, 3650, 'Khám phá và trải nghiệm nền tảng. Làm bài test & đọc tin tức hoàn toàn miễn phí.', '[{"name":"Làm bài test đánh giá dopamine","included":true},{"name":"Đọc tin tức miễn phí hoàn toàn","included":true},{"name":"Tính năng nâng cấp (AI Coach, Lộ trình chuyên sâu,...)","included":false}]', TRUE, 'FREE', NOW()),
('Gói Basic', 69000, 30, 'Dành cho người mới bắt đầu hành trình.', '[{"name":"Toàn bộ liệu trình 21 & 30 ngày","included":true},{"name":"Daily check-in & habit tracker","included":true},{"name":"Dopamine Journal đầy đủ","included":true},{"name":"Tham gia Community (post + comment)","included":true},{"name":"Tham gia Challenge hàng tháng","included":true},{"name":"Thư viện 10 bài audio thiền","included":true},{"name":"Streak system & huy hiệu cơ bản","included":true},{"name":"Hỗ trợ trực tuyến với nhân viên","included":true},{"name":"AI Coach","included":false},{"name":"Group Coaching","included":false}]', TRUE, 'BASIC', NOW()),
('Gói Premium', 199000, 30, 'Được dùng nhiều nhất - Hiệu quả thực sự.', '[{"name":"Toàn bộ liệu trình 21-90 ngày","included":true},{"name":"AI Coach 24/7 (không giới hạn)","included":true},{"name":"AI phân tích hành vi hàng tuần","included":true},{"name":"Liệu trình cá nhân hóa bởi AI","included":true},{"name":"Group Coaching 1x/tuần (online)","included":true},{"name":"Thư viện đầy đủ: 30 audio + CBT sheets","included":true},{"name":"Priority support trong 24h","included":true},{"name":"Progress report thông minh hàng tháng","included":true},{"name":"Mentor 1-1","included":false},{"name":"Chuyên gia tâm lý","included":false}]', TRUE, 'PREMIUM', NOW()),
('Gói Elite', 499000, 30, 'Dành cho Level 4-5 cần hỗ trợ chuyên sâu.', '[{"name":"Tất cả tính năng Premium","included":true},{"name":"Mentor 1-1 (4 buổi/tháng x 45 phút)","included":true},{"name":"2 phiên chuyên gia tâm lý/tháng","included":true},{"name":"Liệu trình 90-180 ngày","included":true},{"name":"Nhóm hỗ trợ nhỏ (max 8 người)","included":true},{"name":"Chứng chỉ hoàn thành khóa học","included":true},{"name":"VIP support - phản hồi trong 4h","included":true},{"name":"Được mời làm Mentor (sau 6 tháng)","included":true}]', TRUE, 'ELITE', NOW());

-- --------------------------------------------------------
-- 3. Articles (Tin tức & Kiến thức)
-- --------------------------------------------------------
INSERT INTO articles (admin_id, category, title, slug, content, thumbnail_url, required_tier, status, published_at, is_active, created_at, updated_at, view_count) VALUES
(1, 'SCIENCE', 'Dopamine là gì và tại sao bộ não lại luôn thèm muốn nó?', 'dopamine-la-gi', '<p>Dopamine thường bị hiểu lầm là "hormone hạnh phúc". Thực chất, nó là chất dẫn truyền thần kinh của sự mong đợi (anticipation) và thèm khát (craving).</p>', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80', 'FREE', 'PUBLISHED', NOW(), TRUE, NOW(), NOW(), 150),
(1, 'PSYCHOLOGY', 'Cơ chế phần thưởng biến thiên: Bí mật sau cơn nghiện TikTok', 'phan-thuong-bien-thien-nghien-tiktok', '<p>Tại sao bạn có thể lướt TikTok hàng giờ mà không chán? Câu trả lời nằm ở "Variable Reward" (Phần thưởng biến thiên).</p>', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80', 'BASIC', 'PUBLISHED', NOW(), TRUE, NOW(), NOW(), 85),
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
INSERT INTO questions (quiz_id, content, type, order_index, dimension, is_active, created_at) VALUES 
(1, 'Bạn dùng điện thoại bao nhiêu tiếng mỗi ngày?', 'SINGLE_CHOICE', 1, 'SEVERITY', TRUE, NOW()),
(1, 'Bạn check thông báo bao nhiêu lần trong lúc làm việc?', 'SINGLE_CHOICE', 2, 'ADHERENCE_RISK', TRUE, NOW());

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
(1, 0, 9, 'Việc sử dụng Internet hiện chưa gây ảnh hưởng lớn, nhưng đã có một vài dấu hiệu cần chú ý.', TRUE),
(1, 10, 16, 'Việc sử dụng Internet đang bắt đầu ảnh hưởng đến thói quen sinh hoạt, sự tập trung hoặc cảm xúc của bạn.', TRUE),
(1, 17, 22, 'Việc sử dụng Internet đang gây ảnh hưởng đáng kể đến cuộc sống hằng ngày và cần được điều chỉnh nghiêm túc.', TRUE),
(1, 23, 30, 'Việc sử dụng Internet đang gây tổn hại nghiêm trọng đến chất lượng cuộc sống của bạn và cần một lộ trình can thiệp chuyên sâu hơn.', TRUE);

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
