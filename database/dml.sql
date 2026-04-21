USE `exe_db`;

-- --------------------------------------------------------
-- 1. Users & Profiles
-- Passwords are set to "password"
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
INSERT INTO subscription_plans (name, price, duration_days, description, is_active, created_at) VALUES
('Gói Khám Phá 1 Tháng', 49000, 30, 'Truy cập đầy đủ các bài viết nghiên cứu tâm lý và thần kinh học trong 1 tháng.', TRUE, NOW()),
('Gói Chuyên Sâu 6 Tháng', 249000, 180, 'Truy cập đầy đủ bài viết trong 6 tháng. Tặng kèm ebook 7-Day Reset.', TRUE, NOW()),
('Gói Đột Phá 1 Năm', 399000, 365, 'Lựa chọn tốt nhất. Quyền truy cập trọn đời vào thư viện tài liệu của Dopaless.', TRUE, NOW());

-- --------------------------------------------------------
-- 3. Articles (Tin tức & Kiến thức)
-- --------------------------------------------------------
INSERT INTO articles (admin_id, category, title, slug, content, thumbnail_url, is_premium, status, published_at, is_active, created_at, updated_at) VALUES
(1, 'SCIENCE', 'Dopamine là gì và tại sao bộ não lại luôn thèm muốn nó?', 'dopamine-la-gi', '<p>Dopamine thường bị hiểu lầm là "hormone hạnh phúc". Thực chất, nó là chất dẫn truyền thần kinh của sự mong đợi (anticipation) và thèm khát (craving).</p><p>Khi bạn nhìn thấy thông báo trên điện thoại, dopamine tăng vọt để thôi thúc bạn nhấn vào xem. Ngay khi bạn thỏa mãn trí tò mò, mức dopamine tụt xuống, khiến bạn lại muốn tìm kiếm kích thích mới.</p>', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80', FALSE, 'PUBLISHED', NOW(), TRUE, NOW(), NOW()),

(1, 'HEALTH', 'Vòng lặp Dopamine: Cơ chế "máy đánh bạc" khiến bạn nghiện mạng xã hội', 'vong-lap-dopamine-may-danh-bac', '<p>Bạn có bao giờ tự hỏi tại sao thao tác "vuốt xuống để làm mới" (pull-to-refresh) lại phổ biến đến vậy?</p><p>Đó là vì nó mô phỏng chính xác hành động kéo cần gạt của máy đánh bạc trong casino. Sự bất định về những gì bạn sắp nhìn thấy (một tin nhắn vui, một bức ảnh đẹp, hay không có gì cả) chính là mồi lửa thổi bùng dopamine trong não bộ.</p>', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80', TRUE, 'PUBLISHED', NOW(), TRUE, NOW(), NOW()),

(1, 'LIFESTYLE', 'Cách thực hiện Dopamine Detox (Giải độc Dopamine) trong 7 ngày', 'dopamine-detox-7-ngay', '<p>Dopamine Detox không phải là từ bỏ hoàn toàn niềm vui. Nó là việc loại bỏ các "niềm vui rẻ tiền" (lướt TikTok, ăn đồ ngọt, chơi game vô độ) để nhường chỗ cho những phần thưởng đến từ sự nỗ lực.</p><h3>Lộ trình 7 ngày</h3><ol><li>Ngày 1-2: Không màn hình trước khi ngủ 2 tiếng.</li><li>Ngày 3-4: Xóa các ứng dụng gây xao nhãng khỏi màn hình chính.</li><li>Ngày 5-7: Áp dụng chế độ "Không màu sắc" (Grayscale) trên điện thoại.</li></ol>', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80', TRUE, 'PUBLISHED', NOW(), TRUE, NOW(), NOW());

-- --------------------------------------------------------
-- 4. Quizzes
-- --------------------------------------------------------
INSERT INTO quizzes (admin_id, title, description, overall_assessment, status, is_active, created_at, updated_at) VALUES
(1, 'Đánh giá mức độ lệ thuộc Smartphone & Mạng xã hội', 'Bài test nhanh 5 phút giúp bạn đánh giá xem mình có đang bị cuốn vào vòng lặp dopamine của các ứng dụng kỹ thuật số hay không. Dựa trên các nghiên cứu về hành vi.', '<p>Dựa trên các câu trả lời của bạn, chúng tôi nhận thấy bạn đang có những dấu hiệu của việc sử dụng công nghệ quá mức.</p><p>Hãy thử bắt đầu với việc áp dụng quy tắc <strong>"Không màn hình 1 giờ trước khi ngủ"</strong> để cho não bộ thời gian phục hồi mức dopamine tự nhiên nhé!</p>', 'PUBLISHED', TRUE, NOW(), NOW()),
(1, 'Đo lường năng lực tập trung sâu (Deep Work)', 'Kiểm tra khả năng duy trì sự chú ý của bạn vào một công việc khó khăn mà không bị xao nhãng.', '<p>Sự tập trung sâu là một siêu năng lực trong kỷ nguyên số. Hãy tiếp tục duy trì và luyện tập nó mỗi ngày.</p>', 'PUBLISHED', TRUE, NOW(), NOW());

-- --------------------------------------------------------
-- 5. Questions for Quiz 1
-- --------------------------------------------------------
INSERT INTO questions (quiz_id, content, type, order_index, is_active, created_at) VALUES
(1, 'Bạn thường sử dụng điện thoại bao nhiêu tiếng mỗi ngày cho việc giải trí (lướt mạng xã hội, xem video ngắn, chơi game)?', 'SINGLE_CHOICE', 1, TRUE, NOW()),
(1, 'Khi thức dậy vào buổi sáng, hành động ĐẦU TIÊN của bạn là gì?', 'SINGLE_CHOICE', 2, TRUE, NOW()),
(1, 'Bạn cảm thấy thế nào nếu để quên điện thoại ở nhà khi ra ngoài đi làm/đi học?', 'SINGLE_CHOICE', 3, TRUE, NOW()),
(1, 'Trong lúc làm việc hoặc học tập, bạn check tin nhắn/thông báo bao nhiêu lần?', 'SINGLE_CHOICE', 4, TRUE, NOW());

-- --------------------------------------------------------
-- 6. Answers & Feedbacks for Quiz 1
-- --------------------------------------------------------
-- Câu 1
INSERT INTO answers (question_id, content, value, feedback_text, order_index, is_active) VALUES
(1, 'Dưới 1 tiếng', 'A', 'Tuyệt vời! Bạn có sự kiểm soát rất tốt. Việc giữ thời gian giải trí số ở mức thấp giúp não bộ không bị "nhờn" dopamine.', 1, TRUE),
(1, 'Từ 1 đến 3 tiếng', 'B', 'Mức độ sử dụng của bạn ở mức trung bình của người trưởng thành. Hãy lưu ý cân bằng với các hoạt động thể chất nhé.', 2, TRUE),
(1, 'Từ 3 đến 5 tiếng', 'C', 'Khá cao. Bạn đang dành một lượng lớn thời gian cho các "kích thích giá rẻ". Cẩn thận với sự suy giảm động lực làm việc.', 3, TRUE),
(1, 'Trên 5 tiếng', 'D', 'Báo động đỏ! Não bộ của bạn đang bị "bắn phá" bởi dopamine liên tục. Điều này giải thích tại sao bạn thường cảm thấy chán nản khi không cầm điện thoại.', 4, TRUE);

-- Câu 2
INSERT INTO answers (question_id, content, value, feedback_text, order_index, is_active) VALUES
(2, 'Uống nước, tập thể dục hoặc vệ sinh cá nhân', 'A', 'Thói quen khởi đầu ngày mới rất lành mạnh. Việc không tiếp xúc màn hình ngay khi dậy giúp duy trì baseline dopamine ổn định.', 1, TRUE),
(2, 'Nghĩ về lịch trình những việc cần làm', 'B', 'Rất tốt, bạn có sự chủ động trong việc kiểm soát ngày mới của mình.', 2, TRUE),
(2, 'Mở điện thoại kiểm tra tin nhắn và thông báo', 'C', 'Hành động này ngay lập tức kích hoạt vòng lặp dopamine. Não bạn sẽ đòi hỏi các kích thích tương tự trong suốt phần còn lại của ngày.', 3, TRUE),
(2, 'Lướt mạng xã hội vô thức trong 15-30 phút trên giường', 'D', 'Việc "nạp" lượng lớn dopamine ngay khi vừa mở mắt sẽ làm cạn kiệt động lực làm các công việc khó nhằn sau đó.', 4, TRUE);

-- Câu 3
INSERT INTO answers (question_id, content, value, feedback_text, order_index, is_active) VALUES
(3, 'Hoàn toàn bình thường, cảm thấy được tự do', 'A', 'Khả năng độc lập với công nghệ của bạn thật đáng nể!', 1, TRUE),
(3, 'Hơi bất tiện trong công việc nhưng không lo lắng', 'B', 'Một phản ứng tâm lý hoàn toàn bình thường và khỏe mạnh.', 2, TRUE),
(3, 'Bồn chồn, thỉnh thoảng có thói quen sờ vào túi quần', 'C', 'Hiện tượng "rung ma" (phantom vibration) và sự bồn chồn cho thấy cơ thể đang khao khát liều dopamine quen thuộc.', 3, TRUE),
(3, 'Cực kỳ lo âu, cảm thấy bị cô lập, phải về lấy bằng được', 'D', 'Bạn có dấu hiệu rõ rệt của Nomophobia (Nỗi sợ không có điện thoại). Hệ thống thần kinh của bạn đang phản ứng như bị cai nghiện.', 4, TRUE);

-- Câu 4
INSERT INTO answers (question_id, content, value, feedback_text, order_index, is_active) VALUES
(4, 'Tôi thường tắt thông báo và chỉ check sau khi làm xong việc', 'A', 'Phong cách làm việc "Deep Work" lý tưởng. Điều này giúp năng suất của bạn vượt trội.', 1, TRUE),
(4, '1-2 lần mỗi giờ', 'B', 'Vẫn nằm trong mức kiểm soát, nhưng mỗi lần check bạn sẽ mất khoảng 15 phút để tập trung lại 100%.', 2, TRUE),
(4, 'Bất cứ khi nào màn hình sáng hoặc điện thoại rung', 'C', 'Sự tập trung của bạn đang bị bẻ gãy liên tục. Bộ não liên tục chuyển đổi trạng thái (context switching) gây tiêu hao năng lượng lớn.', 3, TRUE),
(4, 'Tôi luôn bật một tab MXH bên cạnh lúc làm việc', 'D', 'Sự đa nhiệm (multitasking) này thực chất chỉ làm giảm 40% năng suất và tăng mức độ stress do não phải tiết dopamine cho mạng xã hội và cortisol cho công việc.', 4, TRUE);

-- --------------------------------------------------------
-- 7. Quiz 3: Thói quen tiêu thụ nội dung số (MULTIPLE_CHOICE Demo)
-- --------------------------------------------------------
INSERT INTO quizzes (admin_id, title, description, overall_assessment, status, is_active, created_at, updated_at) VALUES
(1, 'Khám phá thói quen tiêu thụ nội dung số', 'Tìm hiểu xem bạn thường tìm kiếm điều gì trên không gian mạng và cách nó ảnh hưởng đến tư duy của bạn.', '<p>Thói quen tiêu thụ nội dung của bạn rất đa dạng. Hãy chú ý dành thêm thời gian cho các nội dung chuyên sâu thay vì chỉ lướt nội dung ngắn nhé.</p>', 'PUBLISHED', TRUE, NOW(), NOW());

INSERT INTO questions (quiz_id, content, type, order_index, is_active, created_at) VALUES
(3, 'Những loại nội dung nào bạn thường xem nhất trên mạng xã hội? (Chọn nhiều đáp án)', 'MULTIPLE_CHOICE', 1, TRUE, NOW());

INSERT INTO answers (question_id, content, value, feedback_text, order_index, is_active) VALUES
(5, 'Tin tức thời sự & Kiến thức', 'A', 'Việc cập nhật kiến thức là rất tốt cho sự phát triển trí tuệ.', 1, TRUE),
(5, 'Video giải trí ngắn (Reels, TikTok)', 'B', 'Cẩn thận! Nội dung ngắn kích thích dopamine nhanh nhưng dễ gây mệt mỏi cho não.', 2, TRUE),
(5, 'Học ngoại ngữ / Kỹ năng mới', 'C', 'Tuyệt vời, bạn đang tận dụng internet một cách tối ưu nhất.', 3, TRUE),
(5, 'Review ẩm thực / Du lịch', 'D', 'Những nội dung này giúp thư giãn nhưng cũng dễ gây ra cảm giác "FOMO" (sợ bỏ lỡ).', 4, TRUE);
