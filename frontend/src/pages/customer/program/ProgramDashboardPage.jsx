import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronRight, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../hooks/AuthContext';
import { profileApi } from '../../../apis/customerApi';
import './ProgramDashboardPage.css';

/* ─── Mock data (sẽ thay bằng API sau) ─── */
const MOCK_CURRENT_DAY = 1;
const MOCK_TOTAL_DAYS = 120;
const MOCK_STREAK = 1;
const MOCK_IS_SUBSCRIBED = true; // đổi thành false để xem locked overlay

const PHASES = [
  { num: 1, label: 'Thanh Lọc', range: 'Ngày 1–30', active: true, done: false },
  { num: 2, label: 'Củng Cố', range: 'Ngày 31–60', active: false, done: false },
  { num: 3, label: 'Tích Hợp', range: 'Ngày 61–90', active: false, done: false },
  { num: 4, label: 'Làm Chủ', range: 'Ngày 91–120', active: false, done: false },
];

const ROADMAP_PHASES = [
  {
    num: 1,
    label: 'Thanh Lọc & Nhận Thức',
    range: 'Ngày 1–30',
    icon: '🧠',
    focus: 'Ngắt kết nối, đo lường chỉ số nền (baseline), kiểm soát kích thích và thiết lập ranh giới môi trường.',
    science: 'Tăng nhạy cảm thụ thể Dopamine (Nestler, 2004); Kiểm soát kích thích (Koob & Volkow, 2016).',
    weeks: [
      {
        num: 1,
        label: 'Thanh Lọc & Nhận Thức',
        range: 'Ngày 1–7',
        days: [
          {
            num: 1,
            label: 'Đánh giá chỉ số nền & lập quy tắc',
            tasks: [
              'Dùng Sức khỏe kỹ thuật số/Thời gian sử dụng màn hình ghi lại thời gian dùng mạng xã hội 7 ngày qua.',
              'Viết nhật ký: liệt kê 5 yếu tố kích hoạt khiến bạn mở điện thoại vô thức.',
              'Cài app chặn (Freedom/AppBlock) cho 3 app dễ gây xao nhãng nhất, giới hạn 2h/ngày.',
              'Khai báo 1 người thân/bạn bè về cam kết của bạn (người đồng hành cùng mục tiêu).'
            ],
            metrics: ['Thời gian màn hình (chỉ số nền)', 'Số lần mở điện thoại vô thức', 'Mức độ thôi thúc (1-10)', 'Giờ ngủ (>= 7h)']
          },
          {
            num: 2,
            label: 'Nhận diện yếu tố kích hoạt & vùng nguy hiểm',
            tasks: [
              'Vẽ "bản đồ kích hoạt": buồn chán → điện thoại → lướt mạng → cảm giác thỏa mãn nhất thời → lại buồn chán.',
              'Xác định 3 "vùng nguy hiểm" (giường, toilet, bàn ăn) và lập quy tắc không điện thoại tại các vùng này.',
              '30 phút đi bộ không điện thoại — chú ý cảm giác cơ thể (kỹ thuật kết nối thực tại).',
              'Đặt điện thoại ra ngoài phòng ngủ khi đi ngủ.'
            ],
            metrics: ['Số yếu tố kích hoạt nhận ra (>= 3)', 'Thời gian màn hình (< chỉ số nền)', 'Cảm xúc tổng thể (1-10)', 'Phút đi bộ (>= 30)']
          },
          {
            num: 3,
            label: 'Bắt đầu 72 giờ tái tạo năng lượng tự nhiên',
            tasks: [
              'Cắt giảm 50% thời gian mạng xã hội so với chỉ số nền.',
              'Thực hành 10 phút chánh niệm (thở 4-7-8: hít 4s, giữ 7s, thở ra 8s).',
              'Bắt đầu 1 hoạt động thực tế (không màn hình): đọc sách giấy, vẽ, nấu ăn — ít nhất 20 phút.',
              'Nhật ký tối: 3 điều bạn để ý hôm nay mà không qua màn hình.'
            ],
            metrics: ['Thời gian màn hình (50% chỉ số nền)', 'Phút chánh niệm (>= 10)', 'Phút hoạt động thực tế (>= 20)', 'Mức lo lắng (1-10)']
          },
          {
            num: 4,
            label: 'Kiểm soát cảm giác khó chịu ban đầu',
            tasks: [
              'Tập thể dục 20–30 phút — tăng dưỡng chất thần kinh BDNF và năng lượng tích cực tự nhiên.',
              'Ghi lại 3 lần bạn vượt qua được yếu tố kích hoạt hôm nay — dù nhỏ cũng ghi.',
              'Gọi điện (không nhắn tin) cho 1 người bạn/thân nhân — kết nối xã hội thực tế.',
              'Giới hạn kiểm tra email/tin tức: chỉ 2 lần/ngày, mỗi lần ≤ 10 phút.'
            ],
            metrics: ['Phút tập thể dục (>= 20)', 'Số lần vượt qua yếu tố kích hoạt (>= 3)', 'Thời gian màn hình (< ngày 3)', 'Năng lượng (1-10)']
          },
          {
            num: 5,
            label: 'Xây dựng vùng đệm tránh yếu tố kích hoạt',
            tasks: [
              'Nghi thức buổi sáng không màn hình 30 phút đầu sau khi thức dậy.',
              'Dọn dẹp màn hình chính: ẩn các ứng dụng mạng xã hội khỏi màn hình chính.',
              'Kiểm soát thôi thúc (Urge surfing): khi cảm thấy thôi thúc lướt điện thoại, đếm ngược 10 giây, thở sâu, rồi quyết định.',
              'Xác định 1 sở thích mới muốn phát triển trong 30 ngày này.'
            ],
            metrics: ['Phút không điện thoại buổi sáng (>= 30)', 'Số lần kiểm soát thôi thúc', 'Thời gian màn hình (< ngày 4)', 'Hài lòng về ngày (1-10)']
          },
          {
            num: 6,
            label: 'Điều chỉnh môi trường sâu hơn',
            tasks: [
              'Tắt tất cả thông báo không thiết yếu (chỉ giữ cuộc gọi và tin nhắn quan trọng).',
              'Dành 45 phút cho sở thích mới đã chọn ngày 5 — không gián đoạn.',
              'Đánh giá: so sánh thời gian sử dụng màn hình hôm nay với ngày 1.',
              'Viết về 1 kỷ niệm đẹp không liên quan đến internet — khơi lại ký ức thực tế.'
            ],
            metrics: ['Thông báo còn bật (<= 5 loại)', 'Phút tập trung sâu vào sở thích (>= 45)', '% giảm thời gian màn hình (>= 30%)', 'Tâm trạng (1-10)']
          },
          {
            num: 7,
            label: 'Tổng kết tuần 1 & điều chỉnh chiến lược',
            tasks: [
              'Đánh giá 7 chỉ số: thời gian màn hình, giấc ngủ, tâm trạng, mức thôi thúc, thể dục, thời gian thực tế, kết nối xã hội.',
              'Viết 3 điều học được về bản thân từ tuần này.',
              'Xác định điểm yếu nhất và lập kế hoạch cụ thể cho tuần 2.',
              'Phần thưởng không liên quan đến màn hình: massage, ăn ngon, mua sách.'
            ],
            metrics: ['Thời gian màn hình TB (< 50% chỉ số nền)', 'Số ngày đạt mục tiêu (>= 5/7)', 'Tâm trạng trung bình tuần', 'Kế hoạch tuần 2 (Đã viết?)']
          }
        ]
      },
      {
        num: 2,
        label: 'Tái Cân Bằng Thần Kinh',
        range: 'Ngày 8–14',
        days: [
          {
            num: 8,
            label: 'Rèn luyện trì hoãn sự thỏa mãn',
            tasks: [
              'Quy tắc 20-20-20: muốn kiểm tra điện thoại → đợi 20 phút → nếu vẫn muốn → đợi thêm 20 phút.',
              'Đọc sách 30 phút/ngày thay cho lướt mạng thụ động.',
              'Giờ không điện thoại: 8am–10am và 8pm–10pm.',
              'Viết 1 mục tiêu 3 tháng không liên quan đến mạng xã hội.'
            ],
            metrics: ['Lần trì hoãn thành công', 'Phút đọc sách (>= 30)', 'Giờ không điện thoại (>= 4h)', 'Mức tập trung (1-10)']
          },
          {
            num: 9,
            label: 'Tăng cường kết nối thực tế',
            tasks: [
              'Gặp mặt hoặc gọi điện video với bạn bè — cất điện thoại trong khi gặp.',
              'Lắng nghe tích cực: 10 phút nói chuyện không nhìn điện thoại.',
              'Ăn 1 bữa không màn hình trong yên lặng — chú ý mùi vị thức ăn.',
              'Nhật ký: oxytocin từ kết nối thực tế khác hormone thỏa mãn nhất thời từ mạng xã hội thế nào?'
            ],
            metrics: ['Phút kết nối thực tế (>= 30)', 'Bữa ăn không màn hình (>= 1)', 'Chất lượng kết nối', 'Phân biệt oxytocin vs hormone thỏa mãn']
          },
          {
            num: 10,
            label: 'Rèn luyện trạng thái tập trung sâu',
            tasks: [
              '1 nhiệm vụ đòi hỏi tập trung sâu — làm 25 phút không gián đoạn (Pomodoro).',
              'So sánh cảm giác sau khi tập trung sâu so với sau khi lướt mạng.',
              'Tắt internet trong giờ làm việc tập trung (sử dụng các app hỗ trợ chặn như Cold Turkey/Freedom).',
              'Tăng thời gian không điện thoại buổi sáng lên 45 phút.'
            ],
            metrics: ['Số Pomodoro hoàn thành (>= 3)', 'Chất lượng tập trung', 'Phút tập trung sâu liên tục', 'Phút không điện thoại buổi sáng (>= 45)']
          },
          {
            num: 11,
            label: 'Nhận thức cảm xúc nền tảng',
            tasks: [
              'Buổi sáng: viết 3 câu về cảm xúc hiện tại trước khi chạm điện thoại.',
              'Nhận diện 1 cảm xúc khó chịu bạn hay chạy trốn bằng điện thoại — gọi tên nó.',
              'Ngồi với cảm xúc đó 5 phút không làm gì — chỉ quan sát.',
              'Buổi tối: ghi nhận cảm xúc kết thúc ngày mà không cần sự tương tác trên mạng xã hội.'
            ],
            metrics: ['Phút ghi nhật ký cảm xúc (>= 10)', 'Số cảm xúc nhận diện', 'Mức độ khó chịu (1-10)', 'Phút ngồi với cảm xúc khó']
          },
          {
            num: 12,
            label: 'Thiên nhiên & năng lượng tích cực tự nhiên',
            tasks: [
              '30 phút hòa mình vào thiên nhiên — không nghe nhạc hay podcast, chỉ quan sát.',
              'Đi bộ thư giãn (Awe walk): chú ý 3 điều đẹp/thú vị trong môi trường xung quanh.',
              'Viết về sự khác biệt cảm giác sau khi lướt mạng so với sau khi đi bộ trong thiên nhiên.',
              'Chụp ảnh bằng máy ảnh chuyên dụng hoặc máy phim nếu có — không dùng điện thoại thông minh.'
            ],
            metrics: ['Phút trong thiên nhiên (>= 30)', 'Số khoảnh khắc thư thái (>= 3)', 'Mức phục hồi năng lượng', 'Thời gian màn hình (< tuần 1 TB)']
          },
          {
            num: 13,
            label: 'Kỹ năng làm quen với sự lắng đọng',
            tasks: [
              '15 phút hoàn toàn tĩnh lặng — không điện thoại, không nhạc, không sách.',
              'Quan sát suy nghĩ nổi lên khi không có kích thích — ghi chép vào sổ tay.',
              'Thực hành 1 việc đơn giản thủ công: gấp quần áo, rửa bát — chú tâm hoàn toàn.',
              'Nhận ra: tĩnh lặng không đáng sợ — đó là tín hiệu não bộ đang được nghỉ ngơi.'
            ],
            metrics: ['Phút tĩnh lặng hoàn toàn (>= 15)', 'Mức lo lắng khi tĩnh lặng', 'Phút làm việc chú tâm', 'Suy nghĩ nổi lên']
          },
          {
            num: 14,
            label: 'Tổng kết tuần 2 & điều chỉnh',
            tasks: [
              'So sánh 7 chỉ số: tuần 2 so với tuần 1 — ghi con số cụ thể.',
              'Viết: khó khăn lớn nhất tuần này là gì? Bạn xử lý như thế nào?',
              'Xác định 1 chiến lược đã hiệu quả — cam kết tiếp tục áp dụng.',
              'Gọi điện cho người đồng hành — chia sẻ tiến trình thực tế.'
            ],
            metrics: ['% cải thiện thời gian màn hình', 'Ngày đạt 3/4 mục tiêu', 'Tâm trạng trung bình tuần 2', 'Kế hoạch tuần 3 (Đã viết?)']
          }
        ]
      },
      {
        num: 3,
        label: 'Hình Thành Thói Quen',
        range: 'Ngày 15–21',
        days: [
          {
            num: 15,
            label: 'Tập trung sâu cao độ',
            tasks: [
              '90 phút làm việc tập trung sâu liên tục dựa theo nhịp sinh học (Ultradian rhythm).',
              'Ngắt kết nối internet hoàn toàn trong khoảng thời gian này — dùng các công cụ offline.',
              'Sau khi tập trung sâu: ghi nhận cảm giác hoàn thành — đây là nguồn năng lượng lành mạnh bền vững.',
              'Thiết kế thời gian biểu tuần: khi nào online có mục đích, khi nào offline hoàn toàn.'
            ],
            metrics: ['Phút tập trung sâu (>= 90)', 'Số lần bị gián đoạn (<= 2)', 'Mức độ hoàn thành', 'Giờ online có mục đích']
          },
          {
            num: 16,
            label: 'Xây dựng bản sắc mới',
            tasks: [
              'Viết "Tôi là người..." — 5 câu mô tả bản thân không liên quan đến môi trường internet.',
              'Thực hành 1 kỹ năng mới hoàn toàn offline: chơi nhạc cụ, nấu ăn, vẽ, làm thủ công.',
              'Chia sẻ thành tựu thực tế với bạn bè — không đăng lên mạng xã hội.',
              'Ghi nhận: làm điều gì đó chỉ cho riêng mình và người thân thiết — cảm giác thế nào?'
            ],
            metrics: ['Phút học kỹ năng mới (>= 30)', 'Số thành tựu offline', 'Mức tự tin vào bản sắc mới', 'Phút không có khán giả số (>= 60)']
          },
          {
            num: 17,
            label: 'Kiểm soát nỗi sợ bỏ lỡ (FOMO)',
            tasks: [
              'Viết 5 thứ bạn sợ bỏ lỡ nếu không online — đánh giá xem có thực sự quan trọng không.',
              'Hạn chế tiếp nhận thông tin: chỉ đọc tin tức 1 lần/ngày, chọn lọc nguồn chất lượng.',
              'Nhận ra nỗi sợ bỏ lỡ là kết quả của thiết kế thu hút từ các ứng dụng, không phải nhu cầu thực tế.',
              'Viết nhật ký: điều gì thực sự quan trọng với bạn trong 5 năm tới?'
            ],
            metrics: ['Số yếu tố gây sợ bỏ lỡ nhận diện', 'Phút xem tin tức/ngày (<= 15)', 'Mức an tâm khi ngoại tuyến', 'Phút suy ngẫm về giá trị sống']
          },
          {
            num: 18,
            label: 'Tập ngủ không màn hình',
            tasks: [
              'Sạc điện thoại ngoài phòng ngủ — hoặc dùng đồng hồ báo thức cơ học.',
              '1 giờ trước khi ngủ: không màn hình — đọc sách giấy, thiền, viết nhật ký, tắm.',
              'Buổi sáng: không chạm điện thoại cho đến sau khi ăn sáng xong.',
              'Theo dõi chất lượng giấc ngủ: thời gian vào giấc, số lần thức giấc, cảm giác lúc thức dậy.'
            ],
            metrics: ['Phút không màn hình trước ngủ (>= 60)', 'Thời gian vào giấc (<= 20p)', 'Chất lượng giấc ngủ', 'Phút không điện thoại sáng (>= 60)']
          },
          {
            num: 19,
            label: 'Kết nối với cơ thể',
            tasks: [
              'Tập thể dục 30 phút — chú ý cảm giác cơ thể, không nghe nhạc hay podcast.',
              'Ăn 1 bữa hoàn toàn tập trung: không màn hình, không đọc, không podcast.',
              '5 phút thiền quét cơ thể (body scan): quan sát từ chân lên đầu, nhận diện vùng căng thẳng.',
              'Ghi nhận: phân biệt khi nào cơ thể thực sự cần nghỉ ngơi so với khi tâm trí muốn lướt mạng.'
            ],
            metrics: ['Phút thể dục chú tâm (>= 30)', 'Bữa ăn không màn hình (>= 1)', 'Cảm nhận cơ thể rõ rệt', 'Mức kết nối cơ thể']
          },
          {
            num: 20,
            label: 'Điều hòa cảm xúc khó chịu lành mạnh',
            tasks: [
              'Nhận diện 1 cảm xúc khó chịu trong ngày — không chạy trốn bằng cách dùng điện thoại.',
              'Thử 3 cách giải tỏa lành mạnh: tập luyện, viết lách, gọi điện tâm sự — ghi nhận cách hiệu quả nhất.',
              'Viết thư cho bản thân tương lai: "Tôi đang học cách..."',
              'Nhận diện mô thức: cảm xúc khó chịu → thôi thúc dùng điện thoại → cơ hội để rèn luyện.'
            ],
            metrics: ['Cảm xúc khó xử lý lành mạnh', 'Cách giải tỏa hiệu quả nhất', 'Phút viết nhật ký (>= 10)', 'Mức chịu đựng cảm xúc khó']
          },
          {
            num: 21,
            label: 'Cột mốc 21 ngày — Tổng kết quan trọng',
            tasks: [
              'Đánh giá 3 tuần qua: so sánh thời gian màn hình, tâm trạng, giấc ngủ, độ tập trung, kết nối xã hội.',
              'Viết 3 thay đổi lớn nhất trong tư duy và hành vi bạn nhận thấy.',
              'Xác định 2 thói quen tốt đã trở nên tự nhiên (không cần cố gắng nhiều).',
              'Ăn mừng thực tế cùng người thân thiết — 21 ngày là cột mốc rất quan trọng.'
            ],
            metrics: ['Thời gian màn hình tuần 3 vs tuần 1', 'Số thói quen tốt đã tự động (>= 2)', 'Tâm trạng trung bình 3 tuần', 'Kế hoạch 9 ngày cuối tháng']
          }
        ]
      },
      {
        num: 4,
        label: 'Củng Có & Làm Chủ Thói Quen',
        range: 'Ngày 22–30',
        days: [
          {
            num: 22,
            label: 'Xây dựng mối quan hệ lành mạnh với internet',
            tasks: [
              'Xây dựng "quy tắc internet" cá nhân: viết rõ mục đích sử dụng từng ứng dụng.',
              'Phân loại ứng dụng: "công cụ hỗ trợ" (hữu ích) so với "giải trí" (giới hạn thời gian).',
              'Thiết kế 1 ngày lý tưởng — internet chiếm bao nhiêu % thời gian và vào lúc nào?',
              'Thực hành ngày lý tưởng đó — tự đánh giá vào cuối ngày.'
            ],
            metrics: ['Phút internet có mục đích', 'Phút lướt mạng vô thức (< 30)', 'Mức độ tự chủ', 'Sự khác biệt so với tuần 1']
          },
          {
            num: 23,
            label: 'Quản lý căng thẳng không dùng internet',
            tasks: [
              'Nhận diện top 3 tác nhân gây căng thẳng và lập kế hoạch đối phó không dùng điện thoại.',
              'Thực hành giãn cơ/thư giãn cơ bắp 15 phút.',
              'Thở hộp (Box breathing 4-4-4-4): hít 4s, giữ 4s, thở ra 4s, giữ 4s khi căng thẳng.',
              'Đếm xem bao nhiêu lần dùng internet để giảm căng thẳng so với các phương pháp lành mạnh khác.'
            ],
            metrics: ['Căng thẳng xử lý không dùng điện thoại', 'Phút thực hành thư giãn (>= 15)', 'Mức độ căng thẳng', 'Hiệu quả phương pháp đối phó']
          },
          {
            num: 24,
            label: 'Xây dựng thói quen dài hạn',
            tasks: [
              'Thói quen buổi sáng 60 phút không internet: thiền/thể dục/đọc sách/viết nhật ký.',
              'Thói quen buổi tối 60 phút thư giãn không màn hình trước khi ngủ.',
              'Thiết kế thói quen dạng "nếu... thì...": nếu thức dậy thì làm việc A trước khi chạm vào B.',
              'Thực hành cả hai thói quen mới — ghi nhận điều gì cần điều chỉnh.'
            ],
            metrics: ['% thói quen sáng hoàn thành', 'Phút thói quen tối (>= 60)', 'Giờ ngủ/thức ổn định', 'Điểm đánh giá ngày tổng thể']
          },
          {
            num: 25,
            label: 'Nhận diện dấu hiệu báo động & duy trì tự chủ',
            tasks: [
              'Viết 5 dấu hiệu cảnh báo cá nhân trước khi trượt dốc (ví dụ: buồn bã + áp lực công việc + cơ thể mệt mỏi).',
              'Lập "thẻ duy trì tự chủ": khi thôi thúc sử dụng quá mức trỗi dậy → thực hiện ngay 3 bước cụ thể.',
              'Chia sẻ kế hoạch duy trì với người đồng hành.',
              'Nhìn nhận một lần sơ suất sử dụng quá mức — rút ra bài học thay vì tự trách bản thân.'
            ],
            metrics: ['Số dấu hiệu cảnh báo nhận diện (>= 5)', 'Thẻ duy trì tự chủ hoàn thành', 'Phút chia sẻ với người đồng hành', 'Mức tự tin duy trì lối sống mới']
          },
          {
            num: 26,
            label: 'Sáng tạo thực tế',
            tasks: [
              'Dành 1 giờ cho bất kỳ hình thức sáng tạo offline nào: viết lách, vẽ tranh, nấu ăn, làm đồ thủ công.',
              'Không tìm kiếm hướng dẫn online — dùng kiến thức và trực giác hiện có của bản thân.',
              'Ghi nhận cảm xúc khi tạo ra điều gì đó "chưa hoàn hảo" so với các nội dung "hoàn hảo" trên mạng.',
              'Trực tiếp chia sẻ sản phẩm sáng tạo với một người bạn ngoài đời thực.'
            ],
            metrics: ['Phút sáng tạo thực tế (>= 60)', 'Mức độ hài lòng với sản phẩm', 'Mức độ so sánh với mạng', 'Số người thực chia sẻ cùng']
          },
          {
            num: 27,
            label: 'Đóng góp & kết nối ý nghĩa',
            tasks: [
              'Làm 1 việc tốt giúp đỡ người khác ngoài đời thực — không chụp ảnh, không chia sẻ lên mạng.',
              'Gọi điện hoặc gặp mặt hỏi thăm một người quen đã lâu bạn chưa liên lạc.',
              'Viết nhật ký: internet và mạng xã hội đã ảnh hưởng như thế nào đến các mối quan hệ của bạn?',
              'Lên lịch trình gặp gỡ bạn bè, người thân trực tiếp cho tháng tới.'
            ],
            metrics: ['Số hành động giúp đỡ thực tế (>= 1)', 'Chất lượng gắn kết', 'Thời gian kết nối thực tế vs mạng xã hội', 'Lịch trình gặp gỡ tháng tới']
          },
          {
            num: 28,
            label: 'Nhìn lại hành trình & tích hợp lối sống',
            tasks: [
              'Đọc lại toàn bộ nhật ký 28 ngày qua — nhận ra những mô thức hành vi của bản thân.',
              'So sánh dữ liệu thực tế: thời gian màn hình ngày 1 so với hôm nay, tâm trạng, giấc ngủ, tập trung.',
              'Viết 1 trang chia sẻ về "bản thân tôi trước và sau hành trình 28 ngày này".',
              'Chia sẻ những bài học bổ ích này với người đồng hành hoặc một người bạn tin cậy.'
            ],
            metrics: ['% cải thiện thời gian màn hình tổng', 'Cải thiện tâm trạng', 'Cải thiện giấc ngủ', 'Số bài học tự rút ra']
          },
          {
            num: 29,
            label: 'Xây dựng Bản cam kết số cá nhân',
            tasks: [
              'Viết "Bản cam kết số cá nhân": 5–7 nguyên tắc sử dụng thiết bị số và internet của riêng bạn.',
              'Thiết lập ngày nghỉ ngơi số (Digital sabbath): 1 ngày/tuần giảm 90% việc dùng internet.',
              'Cài đặt nhắc nhở: xem lại Bản cam kết số vào cuối mỗi tháng.',
              'Xác định 1 mục tiêu lớn ngoài đời thực trong 3 tháng tới.'
            ],
            metrics: ['Bản cam kết số (Hoàn thiện?)', 'Ngày nghỉ ngơi số đã chọn', 'Mục tiêu thực tế 3 tháng', 'Mức độ cam kết (1-10)']
          },
          {
            num: 30,
            label: 'Ăn mừng & Cam kết hành trình tiếp theo',
            tasks: [
              'Tổng kết: lưu trữ tất cả dữ liệu theo dõi 30 ngày qua vào 1 cuốn sổ hoặc file cá nhân.',
              'Viết một bức thư gửi cho chính mình của 6 tháng sau — kể về hành trình 30 ngày ý nghĩa này.',
              'Ăn mừng trực tiếp ngoài đời thực cùng bạn bè/người thân — chia sẻ câu chuyện của bạn.',
              'Cam kết: duy trì lối sống lành mạnh trong 66 ngày tiếp theo để thói quen bền vững — đặt lịch nhắc nhở.'
            ],
            metrics: ['Hoàn thành 30/30 nhiệm vụ', 'Báo cáo dữ liệu đã lưu', 'Thư tương lai đã viết', 'Cam kết ngày thứ 66']
          }
        ]
      }
    ]
  },
  {
    num: 2,
    label: 'Củng Có Nền Tảng',
    range: 'Ngày 31–60',
    icon: '⚡',
    focus: 'Làm việc sâu, rèn luyện sự thích ứng cảm xúc, tích lũy vốn xã hội thực tế.',
    science: 'Hình thành thói quen cần trung bình 66 ngày (Lally et al., 2010); Tính dẻo của não bộ; Ngăn ngừa trượt dốc dựa trên chánh niệm (MBRP).',
    weeks: [
      {
        num: 5,
        label: 'Làm Việc Tập Trung Sâu',
        range: 'Ngày 31–37',
        description: 'Tăng thời gian tập trung sâu lên 2-3 giờ/ngày. Xây dựng hệ thống hiệu suất thực tế. Đo lường kết quả công việc, không chỉ đo thời gian.',
        tasks: [
          'Thiết kế nghi thức tập trung sâu cá nhân: cùng giờ, cùng địa điểm, cùng tín hiệu khởi động.',
          'Tăng chu kỳ Pomodoro từ 25 lên 50 phút — đo lường sức bền nhận thức thực tế.',
          'Đánh giá kết quả tuần: đã tạo ra sản phẩm gì trong tuần (so với chỉ đọc/xem nội dung)?',
          'Giảm mạng xã hội xuống ≤ 30 phút/ngày bằng tính năng hẹn giờ giới hạn nghiêm ngặt.'
        ],
        metrics: ['Phút tập trung sâu/ngày (>= 120)', 'Kết quả tuần (nhiệm vụ/bài/sản phẩm) (>= 3)', 'Mạng xã hội (phút/ngày) (<= 30)', 'Chuỗi ngày liên tục (ngày)']
      },
      {
        num: 6,
        label: 'Điều Hòa Cảm Xúc',
        range: 'Ngày 38–44',
        description: 'Xây dựng bộ công cụ điều hòa cảm xúc không phụ thuộc internet. Nhận diện "sự đói cảm xúc" — nhiều lần dùng điện thoại là để lấp đầy khoảng trống cảm xúc, không phải để tìm kiếm thông tin cần thiết.',
        tasks: [
          'Ghi nhận tâm trạng hàng daily sáng và tối — theo dõi mô thức cảm xúc theo tuần.',
          'Khi căng thẳng: dùng kỹ thuật dừng lại (Dừng lại, Hít thở, Quan sát, Tiếp tục).',
          'Xây dựng danh mục giải tỏa cá nhân: 10 hoạt động không internet giúp tinh thần tốt hơn.',
          'Nhờ 3 người thân nhận xét về thay đổi của bạn từ tháng 1 — ghi lại phản hồi.'
        ],
        metrics: ['Nhật ký cảm xúc hoàn thành (Sáng + Tối)', 'Số lần dùng kỹ thuật dừng lại', 'Danh mục giải tỏa hoàn thiện (>= 10)', 'Phản hồi từ người thân (>= 3 người)']
      },
      {
        num: 7,
        label: 'Kết Nối Xã Hội Thực Tế',
        range: 'Ngày 45–51',
        description: 'Khôi phục và đầu tư vào mối quan hệ thực tế. Nghiên cứu Harvard 80 năm: chất lượng mối quan hệ là yếu tố hàng đầu quyết định sức khỏe và hạnh phúc (Waldinger, 2015).',
        tasks: [
          'Lập "bản đồ mối quan hệ": vẽ vòng tròn thân thiết — người bạn muốn gắn kết hơn.',
          'Đặt lịch gặp mặt trực tiếp ít nhất 2 lần/tuần với người thân/bạn bè.',
          'Bữa ăn không điện thoại: 1 bữa ăn/tuần với gia đình hoặc bạn bè, điện thoại để ngoài phòng.',
          'Tham gia 1 câu lạc bộ, lớp học, hoặc nhóm trực tiếp phù hợp sở thích.'
        ],
        metrics: ['Lần gặp mặt trực tiếp/tuần (>= 2)', 'Bữa ăn không điện thoại (1/tuần)', 'Tham gia hoạt động cộng đồng (>= 1/tháng)', 'Chất lượng mối quan hệ']
      },
      {
        num: 8,
        label: 'Đánh Giá & Tái Thiết Lập Tháng',
        range: 'Ngày 52–60',
        description: 'Tổng kết 60 ngày. Đây là cột mốc quan trọng — bạn đã vượt qua giai đoạn điều chỉnh thử thách nhất. Não bộ đã hình thành các đường truyền thần kinh mới tốt đẹp.',
        tasks: [
          'So sánh dữ liệu 60 ngày so với ngày 1: thời gian sử dụng màn hình, chất lượng giấc ngủ, độ tập trung, tâm trạng, các mối quan hệ.',
          'Viết "Thư gửi bản thân trong quá khứ": bạn sẽ nói gì với bản thân 60 ngày trước?',
          'Điều chỉnh Bản cam kết số cá nhân dựa trên những gì đã học.',
          'Tự thưởng: tổ chức sự kiện thực tế có ý nghĩa — chuyến đi ngắn, bữa ăn đặc biệt, trải nghiệm mới.'
        ],
        metrics: ['% giảm thời gian màn hình so với ngày 1', 'Cải thiện chất lượng ngủ', 'Cải thiện thời gian tập trung', 'Mức độ hài lòng trong mối quan hệ']
      }
    ]
  },
  {
    num: 3,
    label: 'Tích Hợp Lối Sống',
    range: 'Ngày 61–90',
    icon: '🧭',
    focus: 'Định hình bản sắc cá nhân mới, phát triển sáng tạo, tối ưu hóa năng lượng thể chất.',
    science: 'Thay đổi thói quen dựa trên bản sắc (James Clear, 2018); Thuyết tự quyết (Deci & Ryan, 2000).',
    weeks: [
      {
        num: 9,
        label: 'Định Hình Bản Sắc Mới',
        range: 'Ngày 61–67',
        description: 'Cuộc sống làm chủ bản thân không chỉ đơn thuần là "bỏ thói quen cũ" — đó là sống theo một bản sắc mới tích cực. Giai đoạn này tập trung vào "tôi là người như thế nào" thay vì chỉ là "tôi làm gì".',
        tasks: [
          'Viết "Cẩm nang về tôi": bạn là ai, bạn trân trọng giá trị gì, bạn muốn sống cuộc đời như thế nào?.',
          'Chọn 1 tuyên ngôn bản sắc: "Tôi là người..." và thử thách nó trong mọi quyết định hàng ngày.',
          'Xem xét lại mọi ứng dụng trên điện thoại: cái nào phục vụ bản sắc mới, cái nào đi ngược lại?.',
          'Hỏi trước mỗi lần sử dụng internet: "Điều này có phục vụ cho người mà tôi mong muốn trở thành?"'
        ],
        metrics: ['Cẩm nang về tôi hoàn thiện', 'Áp dụng tuyên ngôn bản sắc/ngày', 'Ứng dụng phù hợp bản sắc', 'Câu hỏi trước khi sử dụng internet']
      },
      {
        num: 10,
        label: 'Sáng Tạo & Ý Nghĩa',
        range: 'Ngày 68–74',
        description: 'Khi não bộ không còn bị kích thích liên tục bởi thế giới ảo, tư duy sáng tạo tự nhiên sẽ trỗi dậy mạnh mẽ.',
        tasks: [
          'Trang viết buổi sáng: viết tự do 3 trang mỗi sáng trước khi làm bất kỳ việc gì (Julia Cameron).',
          'Bắt đầu 1 dự án sáng tạo dài hạn trực tiếp — 30 phút/ngày.',
          'Chủ đề viết nhật ký: "Nếu không có gì cản trở, tôi thực sự mong muốn làm gì?".',
          'Ghi lại mọi ý tưởng nảy sinh trong ngày vào sổ tay giấy.'
        ],
        metrics: ['Ngày viết trang sáng (>= 5/7)', 'Phút làm dự án sáng tạo/ngày (>= 30)', 'Số ý tưởng ghi nhận/tuần', 'Độ sáng tạo tự cảm nhận']
      },
      {
        num: 11,
        label: 'Tối Ưu Hóa Thể Chất',
        range: 'Ngày 75–81',
        description: 'Não bộ và cơ thể là một hệ thống thống nhất. Đây là lúc nâng cấp toàn diện: giấc ngủ sâu hơn, thể thao có định hướng, dinh dưỡng hỗ trợ khả năng thích ứng thần kinh.',
        tasks: [
          'Đồng bộ giờ ngủ/thức: cùng một mốc thời gian 7 ngày/tuần ± 30 phút kể cả cuối tuần.',
          'Tập luyện có cấu trúc: tập tim mạch 3 lần/tuần + tập sức mạnh 2 lần/tuần.',
          'Dinh dưỡng brain: omega-3, việt quất, sô-cô-la đen, trà xanh — bổ sung vào thực đơn hàng ngày.',
          'Tắm nước lạnh 30–60 giây cuối mỗi buổi tắm — tăng các chất dẫn truyền thần kinh hạnh phúc tự nhiên.'
        ],
        metrics: ['Giờ ngủ/thức ổn định (± 30 phút)', 'Ngày tập luyện/tuần (>= 4)', 'Chất lượng giấc ngủ (1-10)', 'Năng lượng buổi sáng']
      },
      {
        num: 12,
        label: 'Cột Mốc 90 Ngày & Kế Hoạch',
        range: 'Ngày 82–90',
        description: '90 ngày là điểm tựa quan trọng trong mọi chương trình phục hồi thói quen. Tại đây bạn có dữ liệu và trải nghiệm thực tế để tự đánh giá và lập kế hoạch cho 6-12 tháng tiếp theo.',
        tasks: [
          'Đánh giá toàn diện 90 ngày: so sánh 15 chỉ số từ ngày 1 đến hôm nay.',
          'Viết "Câu chuyện 90 ngày": hành trình của bạn từ ngày đầu đến hôm nay — 1-2 trang.',
          'Chia sẻ câu chuyện với ít nhất 3 người — trực tiếp để tăng kết nối thực tế.',
          'Lập kế hoạch năm: bạn muốn làm gì với thời gian và năng lượng dồi dào đã tích lũy được?'
        ],
        metrics: ['Đánh giá 90 ngày hoàn thành', '15 chỉ số đã so sánh', 'Người đã chia sẻ câu chuyện (>= 3)', 'Kế hoạch năm']
      }
    ]
  },
  {
    num: 4,
    label: 'Làm Chủ Hoàn Toàn',
    range: 'Ngày 91–120',
    icon: '🏆',
    focus: 'Phong cách tối giản số bền vững, tầm nhìn cuộc sống dài hạn, cống hiến và để lại giá trị lâu dài.',
    science: 'Mô hình PERMA về hạnh phúc bền vững (Seligman, 2011); Thuyết dòng chảy; Lối sống tối giản số (Newport, 2019).',
    weeks: [
      {
        num: 13,
        label: 'Thiết Kế Tối Giản Số',
        range: 'Ngày 91–97',
        description: 'Không phải là ngắt kết nối mãi mãi mà là thiết kế lại mối quan hệ của bạn với công nghệ một cách có chủ đích. Tối giản số không phải chống lại công nghệ mà là định hình cách dùng công nghệ phục vụ cuộc sống của bạn.',
        tasks: [
          'Kiểm kê toàn bộ đời sống số: ứng dụng, đăng ký dịch vụ, danh sách email, tài khoản mạng xã hội — giữ gì, xóa gì?.',
          'Thiết kế "Bản thiết kế đời sống số": công nghệ nào sẽ dùng, dùng vào mục đích gì, trong bao lâu.',
          'Thử thách 30 ngày không công nghệ tùy chọn: tạm ngưng thêm 1 nền tảng không cần thiết.',
          'Đọc hoặc nghe cuốn "Lối sống tối giản thời công nghệ số" của Cal Newport — áp dụng 3 nguyên tắc cốt lõi.'
        ],
        metrics: ['Số ứng dụng/tài khoản đã xóa', 'Bản thiết kế đời sống số hoàn thiện', 'Nền tảng thử nghiệm loại bỏ', 'Nguyên tắc áp dụng']
      },
      {
        num: 14,
        label: 'Mục Tiêu & Tầm Nhìn Dài Hạn',
        range: 'Ngày 98–104',
        description: 'Sử dụng internet quá mức thường để khỏa lấp khoảng trống về mục tiêu sống. Khi bạn có lý tưởng và kế hoạch rõ ràng, thế giới ảo tự khắc giảm sức hút bởi bạn đang có những việc quan trọng hơn cần hoàn thành.',
        tasks: [
          'Thực hành Ikigai: vẽ 4 vòng tròn lý tưởng (điều bạn yêu thích / điều bạn giỏi / điều thế giới cần / điều mang lại thu nhập).',
          'Viết tầm nhìn 1 năm: trong 12 tháng nữa bạn mong muốn đạt được những cột mốc nào?.',
          'Lập kế hoạch ngược: từ tầm nhìn 1 năm, phân bổ thành mục tiêu 3 tháng, 1 tháng, 1 tuần.',
          'Xác định 1 "Dự án lớn" để dành 1 giờ mỗi ngày tập trung thực hiện trong 90 ngày tới.'
        ],
        metrics: ['Ikigai hoàn thành', 'Tầm nhìn 1 năm đã viết', 'Mục tiêu ngược đã phân bổ', 'Dự án lớn đã chọn']
      },
      {
        num: 15,
        label: 'Đóng Góp & Giá Trị Bền Vững',
        range: 'Ngày 105–111',
        description: 'Hạnh phúc đích thực đến từ sự sẻ chia — đóng góp giá trị cho người khác và cộng đồng. Đây là đỉnh cao của tháp hạnh phúc và là yếu tố bảo vệ vững chắc nhất giúp bạn duy trì lối sống lành mạnh lâu dài.',
        tasks: [
          'Tìm 1 cách đóng góp cho cộng đồng phù hợp với năng lực và giá trị của bạn.',
          'Tình nguyện hoặc làm người hướng dẫn: dạy cho người khác một điều bạn thành thạo — trực tiếp, ngoài đời thực.',
          'Chia sẻ hành trình hơn 90 ngày qua với một người đang cần: trò chuyện chân thành, không chia sẻ lên mạng xã hội.',
          'Viết "Tuyên ngôn cống hiến": tôi muốn đóng góp giá trị gì cho thế giới xung quanh?.'
        ],
        metrics: ['Hoạt động cống hiến đã thực hiện', 'Người được hỗ trợ/hướng dẫn', 'Người đã chia sẻ hành trình', 'Tuyên ngôn cống hiến']
      },
      {
        num: 16,
        label: 'Đánh Giá 120 Ngày & Lối Sống Trọn Đời',
        range: 'Ngày 112–120',
        description: 'Đây không phải là điểm kết thúc — đây là nền móng. 120 ngày là khoảng thời gian đủ để não bộ thay đổi cấu trúc tích cực, giúp bạn nhận diện rõ ràng bản thân khi không bị xao nhãng bởi thế giới số.',
        tasks: [
          'Đánh giá dữ liệu toàn diện 120 ngày: tổng hợp tất cả các chỉ số theo dõi trong 4 tháng.',
          'Viết "Tuyên ngôn cá nhân": các nguyên tắc sống cốt lõi của bạn — không chỉ là quy tắc sử dụng thiết bị số mà là kim chỉ nam cuộc sống.',
          'Thiết lập hệ thống duy trì trọn đời: đánh giá hàng tháng, điều chỉnh hàng quý, tái cân bằng hàng năm.',
          'Tự thưởng và tri ân: thực hiện một điều ý nghĩa cùng những người bạn yêu thương.'
        ],
        metrics: ['Đánh giá dữ liệu 120 ngày', 'Tuyên ngôn cá nhân đã viết', 'Hệ thống trọn đời đã thiết lập', 'Hoạt động tự thưởng đã lên kế hoạch']
      }
    ]
  }
];

const TODAY_TASKS = [
  {
    id: 1,
    title: 'Ghi lại thời gian sử dụng mạng xã hội 7 ngày qua',
    sub: 'Công cụ: Tính năng Sức khỏe kỹ thuật số (Digital Wellbeing) hoặc Thời gian sử dụng màn hình (Screen Time) trên điện thoại.',
    badge: '10 phút',
    done: false,
  },
  {
    id: 2,
    title: 'Viết nhật ký: liệt kê 5 yếu tố kích hoạt khiến bạn mở điện thoại vô thức',
    sub: 'Nhận diện các trigger cảm xúc hoặc tình huống (nhàm chán, cô đơn, sau khi ăn...).',
    badge: '15 phút',
    done: false,
  },
  {
    id: 3,
    title: 'Cài đặt ứng dụng chặn (Freedom/AppBlock) cho 3 app dễ gây xao nhãng nhất',
    sub: 'Đặt giới hạn thời gian sử dụng tối đa là 2 giờ/ngày.',
    badge: '10 phút',
    done: false,
  },
  {
    id: 4,
    title: 'Khai báo với 1 người thân/bạn bè về cam kết tự chủ của bạn',
    sub: 'Chọn một người đồng hành cùng mục tiêu (accountability partner) để tăng tính trách nhiệm.',
    badge: '5 phút',
    done: false,
  },
];

const WEEKLY_SCREEN = [
  { day: 'T2', val: 210, max: 300 },
  { day: 'T3', val: 185, max: 300 },
  { day: 'T4', val: 160, max: 300 },
  { day: 'T5', val: 140, max: 300 },
  { day: 'T6', val: 125, max: 300 },
  { day: 'T7', val: 95, max: 300 },
  { day: 'CN', val: 80, max: 300, today: true },
];

const LOCK_FEATURES = [
  { ico: '📅', text: 'Chương trình 120 ngày có cấu trúc chi tiết' },
  { ico: '✅', text: 'Nhiệm vụ hàng ngày & theo dõi tiến trình tự điều chỉnh' },
  { ico: '📊', text: 'Chỉ số tự theo dõi: thời gian màn hình, tâm trạng, giấc ngủ' },
  { ico: '📓', text: 'Nhật ký viết tự do nâng cao nhận thức' },
  { ico: '🔥', text: 'Số ngày liên tiếp & game hóa thúc đẩy động lực' },
  { ico: '🧬', text: 'Khoa học hành vi & tâm lý: CBT · ACT · Khoa học thần kinh' },
];

export default function ProgramDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userTier, updateUser } = useAuth();
  const isSubscribed = userTier && userTier !== 'FREE';

  const [tasks, setTasks] = useState(TODAY_TASKS);
  const [metrics, setMetrics] = useState({ screenTime: 80, mood: 7, sleep: 7, urge: 3, focus: 7 });
  const [journal, setJournal] = useState('');
  const [activePhase, setActivePhase] = useState(0);
  const [showLocked, setShowLocked] = useState(!isSubscribed);
  const [savedToast, setSavedToast] = useState(false);
    const isDetailedView = location.pathname.endsWith('/chi-tiet');
  const activeTab = isDetailedView ? 'daily' : 'roadmap';
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [toastTimeoutId, setToastTimeoutId] = useState(null);

  const showToastMessage = (message, type = 'info') => {
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    setToast({ show: true, message, type });
    const timer = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
    setToastTimeoutId(timer);
  };

  const [expandedMonth, setExpandedMonth] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  const toggleMonth = (mNum) => {
    setExpandedMonth(expandedMonth === mNum ? null : mNum);
    setExpandedWeek(null);
    setExpandedDay(null);
  };

  const toggleWeek = (wKey) => {
    setExpandedWeek(expandedWeek === wKey ? null : wKey);
    setExpandedDay(null);
  };

  const toggleDay = (dNum) => {
    setExpandedDay(expandedDay === dNum ? null : dNum);
  };

  useEffect(() => {
    setShowLocked(!isSubscribed);
  }, [isSubscribed]);

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const res = await profileApi.getProfile();
        if (res.data && res.data.success) {
          updateUser(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching latest profile:', err);
      }
    };
    if (user) {
      fetchLatestProfile();
    }
  }, []);

  const progressPct = Math.round((MOCK_CURRENT_DAY / MOCK_TOTAL_DAYS) * 100);
  const completedTasks = tasks.filter(t => t.done).length;
  const allDone = completedTasks === tasks.length;

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleMetric = (key, val) => {
    setMetrics(prev => ({ ...prev, [key]: Number(val) }));
  };

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const circumference = 2 * Math.PI * 50; // r=50

  return (
    <div className="pd-page">

      {/* ── Locked Overlay ── */}
      {showLocked && (
        <div className="pd-locked-overlay">
          <div className="pd-locked-card">
            <span className="pd-lock-icon">🔐</span>
            <h2 className="pd-lock-title">Tính năng dành cho thành viên</h2>
            <p className="pd-lock-desc">
              Chương trình hỗ trợ 120 ngày có cấu trúc dựa trên bằng chứng khoa học — chỉ dành cho người đã kích hoạt gói dịch vụ.
            </p>
            <div className="pd-lock-features">
              {LOCK_FEATURES.map((f, i) => (
                <div key={i} className="pd-lock-feat">
                  <div className="pd-lock-feat-ico">{f.ico}</div>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
            <button className="pd-lock-cta" onClick={() => navigate('/goi-dich-vu')}>
              Xem các gói dịch vụ →
            </button>
            <button className="pd-lock-back-btn" onClick={() => navigate(-1)}>
              ← Quay lại trang trước
            </button>
          </div>
        </div>
      )}

      {/* ── Hero Banner ── */}
      {activeTab === 'daily' && (
        <div className="pd-hero">
          
        <div className="pd-hero-inner">
          <div className="pd-hero-left">
            <div className="pd-phase-badge">
              <span className="pd-phase-dot" />
              Tháng 1 – Thanh Lọc &amp; Nhận Thức
            </div>
            <h1 className="pd-hero-title">
              Hành trình <span>Ngày {MOCK_CURRENT_DAY}</span> của bạn
            </h1>
            <p className="pd-hero-desc">
              {MOCK_CURRENT_DAY === 1 
                ? 'Não bộ của bạn đang bắt đầu hành trình tự phục hồi tự nhiên.' 
                : `Não bộ của bạn đang tự phục hồi tự nhiên sau ${MOCK_CURRENT_DAY} ngày kiên trì.`} Hôm nay có <strong style={{ color: '#fcd34d' }}>4 nhiệm vụ</strong> — hoàn thành {completedTasks}/4.
            </p>
            <div className="pd-hero-meta">
              <div className="pd-meta-item">
                <span className="pd-meta-icon">📅</span>
                {MOCK_CURRENT_DAY === 1 ? 'Tuần 1 — Thanh lọc & Nhận thức' : 'Tuần 3 — Hình thành thói quen'}
              </div>
              <div className="pd-meta-item">
                <span className="pd-meta-icon">🎯</span>
                Còn {MOCK_TOTAL_DAYS - MOCK_CURRENT_DAY} ngày
              </div>
              <div className="pd-meta-item">
                <span className="pd-meta-icon">🔥</span>
                {MOCK_STREAK} ngày liên tục
              </div>
            </div>
            {activeTab === 'roadmap' && (
              <button 
                className="pd-hero-cta" 
                onClick={() => {
                  navigate('/phac-do/chi-tiet');
                  showToastMessage('Chào mừng bạn đến với Ngày 1! Hãy hoàn thành các nhiệm vụ bên dưới.', 'success');
                }}
              >
                Vào phác đồ chi tiết Ngày 1 →
              </button>
            )}
          </div>

          {/* Progress Ring */}
          <div className="pd-progress-ring-wrap">
            <svg className="pd-ring-svg" viewBox="0 0 120 120">
              <circle className="pd-ring-bg" cx="60" cy="60" r="50" />
              <circle
                className="pd-ring-fill"
                cx="60" cy="60" r="50"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (circumference * progressPct) / 100}
              />
            </svg>
            <div className="pd-ring-center">
              <span className="pd-ring-day">{progressPct}%</span>
              <span className="pd-ring-total">Ngày {MOCK_CURRENT_DAY}/{MOCK_TOTAL_DAYS}</span>
            </div>
            <div className="pd-ring-label">🧠 Tái Cân Bằng</div>
          </div>
        </div>
      </div>
      )}

      {/* ── Roadmap Hero Banner ── */}
      {activeTab === 'roadmap' && (
        <div className="pd-roadmap-hero">
          <div className="pd-roadmap-hero-inner">
            <div className="pd-roadmap-hero-left">
              <div className="pd-roadmap-hero-badge">🗺️ LỘ TRÌNH TỔNG QUAN</div>
              <h1 className="pd-roadmap-hero-title">Lộ Trình Hỗ Trợ 120 Ngày</h1>
              <p className="pd-roadmap-hero-desc">
                Chương trình tự cân bằng cuộc sống và kiến tạo thói quen lành mạnh, dựa trên cơ sở khoa học hành vi và trị liệu nhận thức. Hãy thực hiện từng bước để đạt được sự tự chủ hoàn hảo.
              </p>
              <button 
                className="pd-roadmap-hero-cta" 
                onClick={() => {
                  navigate('/phac-do/chi-tiet');
                  showToastMessage('Chào mừng bạn đến với Ngày 1! Hãy hoàn thành các nhiệm vụ bên dưới.', 'success');
                }}
              >
                Vào phác đồ chi tiết Ngày 1 →
              </button>
            </div>
            <div className="pd-roadmap-hero-right-badge">
              <div className="pd-badge-icon">🎯</div>
              <div className="pd-badge-label">Mục tiêu</div>
              <div className="pd-badge-val">Tái Cân Bằng</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="pd-content">
        <div className="pd-main">
          {activeTab === 'daily' ? (
            <>
              {/* Quay lại Lộ trình */}
              <div className="pd-back-to-roadmap">
                <button 
                  onClick={() => {
                    navigate('/phac-do');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="pd-btn-back"
                >
                  ← Quay lại Lộ Trình 120 Ngày
                </button>
              </div>

              {/* Science Note */}
              <div className="pd-science-note">
                <span className="pd-science-ico">🧬</span>
                <p className="pd-science-text">
                  <strong>Tuần 3 — Hình thành thói quen:</strong> Vỏ não trước trán đang khôi phục khả năng tự kiểm soát sau 2 tuần giảm bớt các kích thích số. Các thói quen mới bắt đầu cần ít nỗ lực hơn. Hãy kiên trì duy trì nhé!
                  <em style={{ display: 'block', marginTop: '4px', fontSize: '0.78rem' }}>Newport (2016) — Làm việc tập trung sâu; Przybylski và cộng sự (2013) — Nghiên cứu về nỗi sợ bỏ lỡ (FOMO)</em>
                </p>
              </div>

              {/* Completion banner */}
              {allDone && (
                <div className="pd-completion-banner">
                  <span className="pd-completion-emoji">🎉</span>
                  <div className="pd-completion-title">Hoàn thành tất cả nhiệm vụ hôm nay!</div>
                  <div className="pd-completion-sub">Tuyệt vời — não bạn đang tiết ra dopamine lành mạnh qua thành tựu thực.</div>
                </div>
              )}

              {/* Today Tasks */}
              <div className="pd-today-block">
                <div className="pd-section-head">
                  <div className="pd-section-title">
                    <span className="pd-section-icon">✅</span>
                    Nhiệm vụ Ngày {MOCK_CURRENT_DAY}
                  </div>
                  <span className="pd-section-link">
                    {completedTasks}/{tasks.length} hoàn thành <ArrowRight size={14} />
                  </span>
                </div>

                <div className="pd-day-label">Hôm nay — Tuần 3, Ngày 1</div>

                <div className="pd-task-list">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className={`pd-task-card ${task.done ? 'done' : ''}`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className="pd-task-check">{task.done ? '✓' : ''}</div>
                      <div className="pd-task-body">
                        <div className="pd-task-title">{task.title}</div>
                        <div className="pd-task-sub">{task.sub}</div>
                      </div>
                      <div className="pd-task-badge">{task.badge}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Tracking */}
              <div className="pd-tracking-block">
                <div className="pd-section-head">
                  <div className="pd-section-title">
                    <span className="pd-section-icon">📊</span>
                    Tự Theo Dõi Hôm Nay
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Kéo để cập nhật</span>
                </div>

                <div className="pd-tracking-grid">
                  {/* Screen Time */}
                  <div className="pd-metric-card screen-time">
                    <div className="pd-metric-top">
                      <span className="pd-metric-label">Thời gian màn hình</span>
                      <span className="pd-metric-icon">📱</span>
                    </div>
                    <input
                      type="range" min="0" max="480" value={metrics.screenTime}
                      className="pd-metric-input"
                      style={{ '--val': `${(metrics.screenTime / 480) * 100}%` }}
                      onChange={e => handleMetric('screenTime', e.target.value)}
                    />
                    <div className="pd-metric-val-row">
                      <span className="pd-metric-val">{metrics.screenTime} phút</span>
                      <span className="pd-metric-max">Mục tiêu: &lt;120p</span>
                    </div>
                  </div>

                  {/* Mood */}
                  <div className="pd-metric-card">
                    <div className="pd-metric-top">
                      <span className="pd-metric-label">Tâm trạng</span>
                      <span className="pd-metric-icon">😊</span>
                    </div>
                    <input
                      type="range" min="1" max="10" value={metrics.mood}
                      className="pd-metric-input"
                      style={{ '--val': `${(metrics.mood / 10) * 100}%` }}
                      onChange={e => handleMetric('mood', e.target.value)}
                    />
                    <div className="pd-metric-val-row">
                      <span className="pd-metric-val">{metrics.mood}/10</span>
                      <span className="pd-metric-max">Tuần qua: 6.2</span>
                    </div>
                  </div>

                  {/* Sleep */}
                  <div className="pd-metric-card">
                    <div className="pd-metric-top">
                      <span className="pd-metric-label">Chất lượng ngủ</span>
                      <span className="pd-metric-icon">🌙</span>
                    </div>
                    <input
                      type="range" min="1" max="10" value={metrics.sleep}
                      className="pd-metric-input"
                      style={{ '--val': `${(metrics.sleep / 10) * 100}%` }}
                      onChange={e => handleMetric('sleep', e.target.value)}
                    />
                    <div className="pd-metric-val-row">
                      <span className="pd-metric-val">{metrics.sleep}/10</span>
                      <span className="pd-metric-max">Mục tiêu: ≥7</span>
                    </div>
                  </div>

                  {/* Urge Level */}
                  <div className="pd-metric-card">
                    <div className="pd-metric-top">
                      <span className="pd-metric-label">Mức thôi thúc sử dụng</span>
                      <span className="pd-metric-icon">⚡</span>
                    </div>
                    <input
                      type="range" min="1" max="10" value={metrics.urge}
                      className="pd-metric-input"
                      style={{ '--val': `${(metrics.urge / 10) * 100}%` }}
                      onChange={e => handleMetric('urge', e.target.value)}
                    />
                    <div className="pd-metric-val-row">
                      <span className="pd-metric-val">{metrics.urge}/10</span>
                      <span className="pd-metric-max">Ngày 1: 9/10</span>
                    </div>
                  </div>

                  {/* Focus */}
                  <div className="pd-metric-card" style={{ gridColumn: '1/-1' }}>
                    <div className="pd-metric-top">
                      <span className="pd-metric-label">Mức độ tập trung</span>
                      <span className="pd-metric-icon">🎯</span>
                    </div>
                    <input
                      type="range" min="1" max="10" value={metrics.focus}
                      className="pd-metric-input"
                      style={{ '--val': `${(metrics.focus / 10) * 100}%` }}
                      onChange={e => handleMetric('focus', e.target.value)}
                    />
                    <div className="pd-metric-val-row">
                      <span className="pd-metric-val">{metrics.focus}/10</span>
                      <span className="pd-metric-max">Tháng 1 TB: 5.8</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Journal */}
              <div className="pd-journal-block">
                <div className="pd-section-head">
                  <div className="pd-section-title">
                    <span className="pd-section-icon">📓</span>
                    Nhật Ký Hôm Nay
                  </div>
                </div>

                <div className="pd-journal-card">
                  <div className="pd-journal-prompts">
                    <div className="pd-journal-prompt">💬 3 điều bạn để ý hôm nay mà không qua màn hình?</div>
                    <div className="pd-journal-prompt">💬 Cảm xúc nào khó chịu nhất và bạn xử lý ra sao?</div>
                    <div className="pd-journal-prompt">💬 Khoảnh khắc nào bạn cảm thấy kiểm soát được nhất?</div>
                  </div>
                  <textarea
                    className="pd-journal-textarea"
                    placeholder="Viết tự do — không cần hoàn hảo, chỉ cần thành thật..."
                    value={journal}
                    onChange={e => setJournal(e.target.value)}
                  />
                  <div className="pd-journal-footer">
                    <span className="pd-journal-chars">{journal.length} ký tự</span>
                    <button className="pd-btn-save" onClick={handleSave}>
                      {savedToast ? '✓ Đã lưu!' : '💾 Lưu nhật ký'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit tracking */}
              <div className="pd-save-row">
                <button className="pd-btn-primary" onClick={handleSave}>
                  {savedToast ? '✓ Đã lưu chỉ số!' : '📊 Lưu chỉ số theo dõi hôm nay'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="pd-roadmap-view">
              <div className="pd-roadmap-intro">
                <h2>Lộ Trình Hỗ Trợ 120 Ngày Tự Cân Bằng &amp; Tái Thiết Lập Thói Quen</h2>
                <p>
                  Chương trình được phát triển dựa trên các nghiên cứu khoa học hành vi và trị liệu tâm lý (CBT, ACT, Chánh niệm). 
                  Lộ trình được thiết kế dưới dạng phân cấp theo Tháng, Tuần và Ngày. Hãy nhấn vào từng mục để xem chi tiết.
                </p>
              </div>

              <div className="pd-roadmap-timeline">
                {ROADMAP_PHASES.map((phase) => {
                  const isMonthExpanded = expandedMonth === phase.num;
                  return (
                    <div key={phase.num} className={`pd-roadmap-month-card phase-${phase.num} ${isMonthExpanded ? 'expanded' : ''}`}>
                      {/* Month Header */}
                      <div className="pd-roadmap-month-header" onClick={() => toggleMonth(phase.num)}>
                        <div className="pd-roadmap-month-info">
                          <span className="pd-roadmap-month-icon">{phase.icon}</span>
                          <div>
                            <span className="pd-roadmap-month-badge">{phase.range}</span>
                            <h3>Tháng {phase.num}: {phase.label}</h3>
                          </div>
                        </div>
                        <div className="pd-roadmap-month-toggle">
                          {isMonthExpanded ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
                        </div>
                      </div>

                      {/* Month Body (Expanded) */}
                      {isMonthExpanded && (
                        <div className="pd-roadmap-month-body">
                          <div className="pd-roadmap-month-meta">
                            <div className="pd-roadmap-meta-focus">
                              <strong>🎯 Trọng tâm:</strong> {phase.focus}
                            </div>
                            <div className="pd-roadmap-meta-science">
                              <strong>🧬 Cơ sở khoa học:</strong> {phase.science}
                            </div>
                          </div>

                          {/* Weeks List */}
                          <div className="pd-roadmap-weeks-list">
                            {phase.weeks.map((week) => {
                              const weekKey = `m${phase.num}-w${week.num}`;
                              const isWeekExpanded = expandedWeek === weekKey;
                              const isWeekLocked = phase.num > 1; // Khóa các tuần của Tháng 2, 3, 4 trong mockup này
                              
                              return (
                                <div key={week.num} className={`pd-roadmap-week-item ${isWeekExpanded ? 'expanded' : ''} ${isWeekLocked ? 'locked' : ''}`}>
                                  {/* Week Header */}
                                  <div 
                                    className="pd-roadmap-week-header" 
                                    onClick={() => {
                                      if (isWeekLocked) {
                                        showToastMessage('Nội dung tuần này hiện đang khóa. Bạn cần hoàn thành các tuần trước để tiếp tục lộ trình.', 'lock');
                                        return;
                                      }
                                      toggleWeek(weekKey);
                                    }}
                                  >
                                    <span className="pd-roadmap-week-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                      Tuần {week.num}: {week.label} <span className="pd-roadmap-week-range">({week.range})</span>
                                      {isWeekLocked && <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center' }}>🔒</span>}
                                    </span>
                                    <div className="pd-roadmap-week-toggle">
                                      {isWeekLocked ? null : (isWeekExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />)}
                                    </div>
                                  </div>

                                  {/* Week Body (Expanded) */}
                                  {isWeekExpanded && !isWeekLocked && (
                                    <div className="pd-roadmap-week-body">
                                      {/* Month 1: Days list */}
                                      {phase.num === 1 ? (
                                        <div className="pd-roadmap-days-list">
                                          {week.days.map((day) => {
                                            const isDayExpanded = expandedDay === day.num;
                                            const isDayLocked = day.num !== 1; // Trong mockup này chỉ mở khóa Ngày 1
                                            
                                            return (
                                               <div key={day.num} className={`pd-roadmap-day-item ${isDayExpanded ? 'expanded' : ''} ${isDayLocked ? 'locked' : ''}`}>
                                                 {/* Day Header */}
                                                 <div 
                                                   className="pd-roadmap-day-header" 
                                                   onClick={() => {
                                                     if (isDayLocked) {
                                                       showToastMessage('Ngày này hiện đang khóa. Bạn cần hoàn thành nhiệm vụ ngày trước để tiếp tục hành trình.', 'lock');
                                                       return;
                                                     }
                                                     navigate('/phac-do/chi-tiet');
                                                     window.scrollTo({ top: 0, behavior: 'smooth' });
                                                     showToastMessage('Chào mừng bạn đến với Ngày 1! Hãy hoàn thành các nhiệm vụ bên dưới.', 'success');
                                                   }}
                                                 >
                                                   <span className="pd-roadmap-day-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                     Ngày {day.num} — {day.label}
                                                     {isDayLocked && <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center' }}>🔒</span>}
                                                   </span>
                                                   <div className="pd-roadmap-day-toggle">
                                                     {isDayLocked ? null : <ArrowRight size={16} style={{ color: 'var(--teal)' }} />}
                                                   </div>
                                                 </div>

                                                 {/* Day Body (Expanded) */}
                                                {isDayExpanded && !isDayLocked && (
                                                  <div className="pd-roadmap-day-body">
                                                    {/* Tasks */}
                                                    <div className="pd-roadmap-day-section">
                                                      <div className="pd-roadmap-day-section-title">📋 Nhiệm vụ hàng ngày:</div>
                                                      <ul className="pd-roadmap-day-tasks">
                                                        {day.tasks.map((task, i) => (
                                                          <li key={i}>
                                                            <span className="pd-roadmap-dot">•</span> {task}
                                                          </li>
                                                        ))}
                                                      </ul>
                                                    </div>
                                                    {/* Metrics */}
                                                    <div className="pd-roadmap-day-section">
                                                      <div className="pd-roadmap-day-section-title">📊 Chỉ số tracking:</div>
                                                      <div className="pd-roadmap-day-metrics">
                                                        {day.metrics.map((metric, i) => (
                                                          <span key={i} className="pd-roadmap-metric-tag">{metric}</span>
                                                        ))}
                                                      </div>
                                                    </div>
                                                    {/* Action button to proceed */}
                                                    <button 
                                                      className="pd-btn-start-day"
                                                      onClick={() => {
                                                        navigate('/phac-do/chi-tiet');
                                                        showToastMessage('Chào mừng bạn đến với Ngày 1! Hãy hoàn thành các nhiệm vụ bên dưới.', 'success');
                                                      }}
                                                    >
                                                      Thực hiện nhiệm vụ Ngày 1 →
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        /* Month 2, 3, 4: Weekly details directly */
                                        <div className="pd-roadmap-week-details">
                                          <p className="pd-roadmap-week-desc">{week.description}</p>
                                          
                                          <div className="pd-roadmap-day-section">
                                            <div className="pd-roadmap-day-section-title">📋 Nhiệm vụ trong tuần:</div>
                                            <ul className="pd-roadmap-day-tasks">
                                              {week.tasks.map((task, i) => (
                                                <li key={i}>
                                                  <span className="pd-roadmap-dot">•</span> {task}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>

                                          <div className="pd-roadmap-day-section">
                                            <div className="pd-roadmap-day-section-title">📊 Chỉ số tracking tuần:</div>
                                            <div className="pd-roadmap-day-metrics">
                                              {week.metrics.map((metric, i) => (
                                                <span key={i} className="pd-roadmap-metric-tag">{metric}</span>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="pd-sidebar">
          {/* Streak / Roadmap Progress */}
          {activeTab === 'roadmap' ? (
            <div className="pd-roadmap-progress-card">
              <div className="pd-roadmap-progress-header">
                <span className="pd-roadmap-progress-icon">🎯</span>
                <div>
                  <span className="pd-roadmap-progress-title">Tiến Trình Tổng</span>
                  <span className="pd-roadmap-progress-sub">Chương trình 120 Ngày</span>
                </div>
              </div>
              <div className="pd-roadmap-progress-body">
                <div className="pd-roadmap-progress-number">Ngày 1 / 120</div>
                <div className="pd-roadmap-progress-bar-wrap">
                  <div className="pd-roadmap-progress-bar-fill" style={{ width: '0.83%' }} />
                </div>
                <div className="pd-roadmap-progress-footer">
                  <span>Tháng 1: Thanh Lọc</span>
                  <span style={{ color: 'var(--teal)' }}>0.83%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="pd-streak-card">
              <span className="pd-streak-icon">🔥</span>
              <span className="pd-streak-num">{MOCK_STREAK}</span>
              <span className="pd-streak-label">ngày liên tục</span>
              <div className="pd-streak-sub">Kỷ lục cá nhân: 15 ngày · Tiếp tục chuỗi này!</div>
            </div>
          )}

          {activeTab === 'daily' && (
            <>
              {/* Weekly Bar Chart */}
          <div className="pd-chart-card">
            <div className="pd-chart-title">Thời gian màn hình (phút/ngày)</div>
            <div className="pd-chart-sub">7 ngày qua — xu hướng giảm 📉</div>
            <div className="pd-bar-chart">
              {WEEKLY_SCREEN.map((d, i) => {
                const heightPct = (d.val / d.max) * 100;
                return (
                  <div key={i} className="pd-bar-col">
                    <span className="pd-bar-val">{d.val}</span>
                    <div
                      className={`pd-bar ${d.today ? 'today' : ''}`}
                      style={{ height: `${heightPct}%` }}
                      title={`${d.day}: ${d.val} phút`}
                    />
                    <span className="pd-bar-day">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="pd-stats-card">
            <div className="pd-stats-title">📈 Cải Thiện Tổng</div>
            <div className="pd-stat-rows">
              <div className="pd-stat-row">
                <div className="pd-stat-ico teal">📱</div>
                <div className="pd-stat-info">
                  <div className="pd-stat-name">Giảm thời gian màn hình</div>
                  <div className="pd-stat-bar-wrap">
                    <div className="pd-stat-bar-fill" style={{ width: '62%' }} />
                  </div>
                </div>
                <div className="pd-stat-val" style={{ color: 'var(--teal)' }}>−62%</div>
              </div>

              <div className="pd-stat-row">
                <div className="pd-stat-ico orange">😊</div>
                <div className="pd-stat-info">
                  <div className="pd-stat-name">Tâm trạng cải thiện</div>
                  <div className="pd-stat-bar-wrap">
                    <div className="pd-stat-bar-fill orange" style={{ width: '40%' }} />
                  </div>
                </div>
                <div className="pd-stat-val" style={{ color: 'var(--accent)' }}>+40%</div>
              </div>

              <div className="pd-stat-row">
                <div className="pd-stat-ico purple">🌙</div>
                <div className="pd-stat-info">
                  <div className="pd-stat-name">Chất lượng ngủ</div>
                  <div className="pd-stat-bar-wrap">
                    <div className="pd-stat-bar-fill" style={{ width: '55%' }} />
                  </div>
                </div>
                <div className="pd-stat-val">+55%</div>
              </div>

              <div className="pd-stat-row">
                <div className="pd-stat-ico green">🎯</div>
                <div className="pd-stat-info">
                  <div className="pd-stat-name">Khả năng tập trung</div>
                  <div className="pd-stat-bar-wrap">
                    <div className="pd-stat-bar-fill" style={{ width: '38%' }} />
                  </div>
                </div>
                <div className="pd-stat-val">+38%</div>
              </div>
            </div>
          </div>

          {/* Next milestone */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fff9ec, #fff3e8)',
              border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.4rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text)', marginBottom: '0.8rem' }}>
              🏆 Milestone tiếp theo
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem', lineHeight: 1.5, fontWeight: 300 }}>
              Còn <strong style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>6 ngày</strong> nữa đến Ngày 7 — mốc quan trọng đầu tiên!
            </div>
            <div style={{ background: 'rgba(249,115,22,0.1)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
              <div style={{ width: '14%', height: '100%', background: 'linear-gradient(90deg, var(--accent), #fb923c)', borderRadius: 999 }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.4rem', textAlign: 'right' }}>
              Ngày 1/7
            </div>
          </div>
        </>
      )}
    </div>
      </div>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`pd-toast ${toast.type}`}>
          <span className="pd-toast-icon">
            {toast.type === 'lock' ? '🔒' : toast.type === 'success' ? '✓' : 'ℹ️'}
          </span>
          <span className="pd-toast-text">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
