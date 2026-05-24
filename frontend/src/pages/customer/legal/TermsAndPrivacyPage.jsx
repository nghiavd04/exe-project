import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './TermsAndPrivacyPage.css';

export default function TermsAndPrivacyPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') === 'privacy' ? 'privacy' : 'terms';

    useEffect(() => {
        document.title = activeTab === 'privacy' 
            ? 'Chính sách bảo mật – Dopaless' 
            : 'Điều khoản sử dụng – Dopaless';
        window.scrollTo(0, 0);
    }, [activeTab]);

    const handleTabChange = (tab) => {
        setSearchParams({ tab });
    };

    return (
        <main className="legal-page">
            {/* ── HERO HEADER ── */}
            <header className="legal-hero">
                <div className="legal-hero-content">
                    <span className="legal-badge">Trung tâm pháp lý</span>
                    <h1>Điều khoản & Bảo mật</h1>
                    <p>Chào mừng bạn đến với Dopaless. Vui lòng đọc kỹ các điều khoản và chính sách dưới đây để hiểu rõ quyền lợi và trách nhiệm của mình khi sử dụng dịch vụ.</p>
                </div>
            </header>

            {/* ── TAB NAVIGATOR ── */}
            <div className="legal-tabs-container">
                <div className="legal-tabs">
                    <button 
                        className={`legal-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
                        onClick={() => handleTabChange('terms')}
                    >
                        📝 Điều khoản sử dụng
                    </button>
                    <button 
                        className={`legal-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
                        onClick={() => handleTabChange('privacy')}
                    >
                        🔒 Chính sách bảo mật
                    </button>
                </div>
            </div>

            {/* ── CONTENT AREA ── */}
            <section className="legal-content-section">
                <div className="legal-card">
                    {activeTab === 'terms' ? (
                        <div className="legal-body fade-in">
                            <h2>Điều khoản sử dụng dịch vụ</h2>
                            <p className="legal-updated">Cập nhật lần cuối: Ngày 24 tháng 5 năm 2026</p>
                            
                            <hr />

                            <div className="legal-block">
                                <h3>1. Chấp nhận điều khoản</h3>
                                <p>Bằng việc truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ dịch vụ nào trên nền tảng Dopaless, bạn đồng ý tuân thủ và chịu sự ràng buộc bởi các Điều khoản sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản, vui lòng không sử dụng dịch vụ của chúng tôi.</p>
                            </div>

                            <div className="legal-block">
                                <h3>2. Tuyên bố từ chối trách nhiệm y khoa (Disclaimer)</h3>
                                <div className="legal-alert-box warning">
                                    <strong>⚠️ QUAN TRỌNG:</strong> Tất cả các bài trắc nghiệm tâm lý, đánh giá mức độ phụ thuộc Dopamine và các lộ trình cải thiện sự tập trung trên Dopaless chỉ mang tính chất giáo dục, tham khảo và hỗ trợ tự nhận thức. Chúng tôi <strong>không cung cấp chẩn đoán y khoa, trị liệu hay khuyên can chuyên môn</strong> thay thế cho ý kiến của bác sĩ tâm lý hoặc chuyên gia y tế có chuyên môn.
                                </div>
                                <p>Bạn không nên dựa vào các thông tin trên hệ thống để tự chẩn đoán hoặc tự ý điều trị các vấn đề về sức khỏe tinh thần. Hãy luôn tham khảo ý kiến chuyên gia y tế trước khi thực hiện các thay đổi lớn liên quan đến hành vi hoặc sức khỏe.</p>
                            </div>

                            <div className="legal-block">
                                <h3>3. Quyền sở hữu trí tuệ</h3>
                                <p>Toàn bộ nội dung trên website Dopaless, bao gồm nhưng không giới hạn ở: bài viết chia sẻ, bộ câu hỏi trắc nghiệm, hình ảnh, mã nguồn, logo và thiết kế giao diện đều thuộc quyền sở hữu trí tuệ của Dopaless hoặc các bên cấp phép liên quan. Bạn không được phép sao chép, phân phối hoặc thương mại hóa bất kỳ nội dung nào khi chưa có sự đồng ý bằng văn bản từ chúng tôi.</p>
                            </div>

                            <div className="legal-block">
                                <h3>4. Trách nhiệm của người dùng</h3>
                                <p>Khi sử dụng Dopaless, bạn cam kết:</p>
                                <ul>
                                    <li>Cung cấp thông tin đăng ký chính xác, trung thực.</li>
                                    <li>Bảo mật thông tin đăng nhập cá nhân (mật khẩu) và tự chịu trách nhiệm cho các hoạt động diễn ra dưới tài khoản của mình.</li>
                                    <li>Không thực hiện các hành vi gây hại đến hệ thống, tấn công mạng, phát tán mã độc hoặc quấy rối thành viên khác trong cộng đồng.</li>
                                    <li>Không sử dụng công cụ tự động (bots, crawlers) để thu thập dữ liệu trái phép từ website.</li>
                                </ul>
                            </div>

                            <div className="legal-block">
                                <h3>5. Thay đổi và tạm ngừng dịch vụ</h3>
                                <p>Dopaless có quyền bổ sung, thay đổi hoặc gỡ bỏ bất kỳ tính năng nào của dịch vụ vào bất kỳ lúc nào mà không cần báo trước. Chúng tôi cũng có quyền khóa tài khoản của người dùng nếu phát hiện hành vi vi phạm các điều khoản này.</p>
                            </div>

                            <div className="legal-block">
                                <h3>6. Liên hệ giải quyết tranh chấp</h3>
                                <p>Mọi tranh chấp phát sinh từ việc sử dụng dịch vụ của Dopaless trước hết sẽ được ưu tiên giải quyết thông qua thương lượng hòa giải. Nếu không đạt được thỏa thuận chung, tranh chấp sẽ được đưa ra giải quyết tại tòa án có thẩm quyền tại Việt Nam.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="legal-body fade-in">
                            <h2>Chính sách bảo mật thông tin</h2>
                            <p className="legal-updated">Cập nhật lần cuối: Ngày 24 tháng 5 năm 2026</p>
                            
                            <hr />

                            <div className="legal-block">
                                <h3>1. Thông tin chúng tôi thu thập</h3>
                                <p>Để cung cấp trải nghiệm tốt nhất và lộ trình cá nhân hóa, chúng tôi thu thập các nhóm dữ liệu sau:</p>
                                <ul>
                                    <li><strong>Thông tin tài khoản:</strong> Họ tên, địa chỉ email, ảnh đại diện khi bạn đăng ký tài khoản hoặc đăng nhập thông qua các cổng liên kết (Google, Facebook).</li>
                                    <li><strong>Dữ liệu trắc nghiệm:</strong> Các câu trả lời của bạn trong quá trình làm bài kiểm tra tâm lý, mức độ phụ thuộc dopamine và lịch sử các lượt làm test.</li>
                                    <li><strong>Dữ liệu kỹ thuật:</strong> Địa chỉ IP, loại thiết bị, trình duyệt bạn sử dụng và thông tin về cách bạn tương tác với website của chúng tôi (thông qua cookie).</li>
                                </ul>
                            </div>

                            <div className="legal-block">
                                <h3>2. Mục đích sử dụng thông tin</h3>
                                <p>Dữ liệu thu thập được sử dụng nhằm mục đích:</p>
                                <ul>
                                    <li>Tính toán và đưa ra kết quả đánh giá trắc nghiệm chính xác nhất cho bạn.</li>
                                    <li>Gợi ý lộ trình cải thiện hành vi và thói quen tập trung mang tính cá nhân hóa.</li>
                                    <li>Gửi email bản tin hàng tuần hoặc cập nhật hệ thống (bạn có thể từ chối nhận bất cứ lúc nào).</li>
                                    <li>Phân tích số liệu tổng hợp (không định danh) để cải tiến nội dung bài kiểm tra và nâng cấp giao diện hệ thống.</li>
                                </ul>
                            </div>

                            <div className="legal-block">
                                <h3>3. Cam kết bảo mật kết quả trắc nghiệm</h3>
                                <div className="legal-alert-box success">
                                    <strong>🔒 BẢO MẬT TUYỆT ĐỐI:</strong> Kết quả trắc nghiệm và thông tin phản hồi của bạn là hoàn toàn riêng tư. Dopaless cam kết <strong>không chia sẻ, mua bán hay tiết lộ kết quả kiểm tra cá nhân</strong> của bạn cho bất kỳ bên thứ ba nào khi chưa có sự đồng ý rõ ràng từ bạn.
                                </div>
                                <p>Dữ liệu cá nhân của bạn được lưu trữ an toàn trên hệ thống máy chủ mã hóa và chỉ có bạn mới có quyền xem lịch sử cũng như kết quả chi tiết của các bài đánh giá của chính mình trong trang Hồ sơ cá nhân.</p>
                            </div>

                            <div className="legal-block">
                                <h3>4. Quyền của bạn đối với dữ liệu cá nhân</h3>
                                <p>Bạn có toàn quyền kiểm soát dữ liệu cá nhân của mình, bao gồm:</p>
                                <ul>
                                    <li>Xem và chỉnh sửa thông tin hồ sơ của bạn bất cứ lúc nào.</li>
                                    <li>Yêu cầu hệ thống xóa toàn bộ dữ liệu lịch sử làm trắc nghiệm hoặc yêu cầu xóa tài khoản vĩnh viễn bằng cách liên hệ với ban quản trị qua email support.</li>
                                    <li>Quản lý việc sử dụng cookie thông qua cài đặt trình duyệt của bạn.</li>
                                </ul>
                            </div>

                            <div className="legal-block">
                                <h3>5. Thay đổi chính sách bảo mật</h3>
                                <p>Chúng tôi có thể cập nhật chính sách bảo mật này để phù hợp với sự phát triển của dịch vụ hoặc các quy định pháp luật mới. Mọi thay đổi lớn sẽ được thông báo nổi bật trên trang chủ hoặc gửi trực tiếp qua email đăng ký của bạn.</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
