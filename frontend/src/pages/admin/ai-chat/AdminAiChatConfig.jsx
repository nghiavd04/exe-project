import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../apis/adminApi';
import { Sparkles, Save, RotateCcw, AlertCircle, CheckCircle, HelpCircle, AlertTriangle } from 'lucide-react';
import './AdminAiChatConfig.css';

const DEFAULT_PROMPT_TEMPLATE = `Bạn là Dopaless AI, trợ lý hỗ trợ người dùng xây dựng thói quen sử dụng công nghệ lành mạnh và quản lý dopamine trong cuộc sống hàng ngày.

MỤC TIÊU:
- Hỗ trợ người dùng hiểu về dopamine, thói quen, sự tập trung, quản lý thời gian sử dụng mạng xã hội và sức khỏe số.
- Đưa ra lời khuyên mang tính giáo dục, thực tế và an toàn.
- Khuyến khích xây dựng thói quen tích cực, cân bằng cuộc sống và sử dụng công nghệ có ý thức.

PHẠM VI ĐƯỢC PHÉP TRẢ LỜI:
- Dopamine và cơ chế phần thưởng trong não.
- Cai nghiện mạng xã hội, TikTok, Facebook, Instagram, YouTube, game.
- Quản lý thời gian sử dụng điện thoại.
- Tập trung học tập và làm việc.
- Xây dựng thói quen tốt.
- Digital Detox.
- Mindfulness cơ bản.
- Quản lý sự trì hoãn.
- Các bài tập giúp giảm phụ thuộc vào thiết bị điện tử.
- Giải thích các bài kiểm tra, thống kê và kết quả đánh giá trong hệ thống Dopaless.

KHÔNG ĐƯỢC:
- Trả lời các câu hỏi không liên quan đến dopamine, thói quen, sức khỏe số hoặc mục tiêu của Dopaless.
- Thảo luận chính trị, tôn giáo, tài chính, pháp luật hoặc các chủ đề ngoài phạm vi.
- Đưa ra chẩn đoán y khoa hoặc tâm thần.
- Tuyên bố người dùng mắc bất kỳ bệnh lý nào.
- Đưa ra lời khuyên thay thế bác sĩ hoặc chuyên gia tâm lý.
- Hướng dẫn tự gây hại, bạo lực, chất kích thích hoặc hành vi nguy hiểm.
- Sử dụng ngôn ngữ gây hoảng sợ, kỳ thị hoặc đánh giá người dùng.

KHI NGƯỜI DÙNG HỎI NGOÀI PHẠM VI:
Trả lời: "Tôi là trợ lý của Dopaless và chỉ hỗ trợ các chủ đề liên quan đến dopamine, thói quen, quản lý thời gian sử dụng thiết bị và sức khỏe số. Hãy đặt câu hỏi trong các lĩnh vực này để tôi có thể hỗ trợ bạn."

LƯU Ý AN TOÀN:
- Luôn giải thích rằng thông tin chỉ mang tính giáo dục.
- Không khẳng định các thông tin y khoa chưa được xác thực.
- Nếu người dùng mô tả tình trạng sức khỏe nghiêm trọng hoặc khủng hoảng tâm lý, khuyến khích họ tìm kiếm sự hỗ trợ từ chuyên gia hoặc cơ sở y tế phù hợp.
- Tránh sử dụng các từ ngữ nhạy cảm hoặc mang tính chẩn đoán như: "trầm cảm", "rối loạn tâm thần", "nghiện nặng", "bệnh lý não", trừ khi đang giải thích khái niệm chung một cách trung lập và mang tính giáo dục.

PHONG CÁCH TRẢ LỜI:
- Ngắn gọn, thân thiện, dễ hiểu.
- Tập trung vào giải pháp thực tế.
- Ưu tiên các bước hành động cụ thể.
- Không lan man sang chủ đề khác.
- Luôn giữ cuộc trò chuyện xoay quanh mục tiêu cải thiện sức khỏe số và quản lý dopamine.`;

export default function AdminAiChatConfig() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      const res = await adminApi.getAiPrompt();
      if (res.data.success) {
        setPrompt(res.data.data.prompt);
      }
    } catch (err) {
      console.error('Lỗi khi tải Prompt chỉ dẫn:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Không thể tải chỉ dẫn Prompt từ hệ thống.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isSaving) return;

    try {
      setIsSaving(true);
      setMessage({ type: '', text: '' });
      const res = await adminApi.updateAiPrompt(prompt.trim());
      if (res.data.success) {
        setMessage({
          type: 'success',
          text: 'Đã lưu cấu hình Prompt và áp dụng cho Trợ lý AI thành công!'
        });
      }
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình Prompt:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Lưu cấu hình Prompt thất bại. Vui lòng thử lại.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setShowResetModal(true);
  };

  const confirmResetToDefault = () => {
    setPrompt(DEFAULT_PROMPT_TEMPLATE);
    setMessage({
      type: 'info',
      text: 'Đã điền mẫu mặc định. Vui lòng nhấn "Lưu cấu hình" để áp dụng thực tế.'
    });
    setShowResetModal(false);
  };

  return (
    <div className="admin-prompt-config-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Cấu hình Trợ lý AI (Prompt Config)</h1>
          <p className="admin-page-subtitle">
            Cấu hình System Instruction (Chỉ dẫn hệ thống) để thiết lập hành vi, giọng điệu và phạm vi kiến thức cho Trợ lý ảo DOPA LESS.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="admin-prompt-loader-container">
          <div className="admin-prompt-spinner"></div>
          <p>Đang tải cấu hình AI...</p>
        </div>
      ) : (
        <div className="admin-prompt-card-wrapper">
          <form onSubmit={handleSave} className="admin-prompt-form">
            {/* Hộp thông báo kết quả */}
            {message.text && (
              <div className={`prompt-message-alert alert-${message.type}`}>
                {message.type === 'error' && <AlertCircle size={18} className="alert-icon" />}
                {message.type === 'success' && <CheckCircle size={18} className="alert-icon" />}
                {message.type === 'info' && <HelpCircle size={18} className="alert-icon" />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Hướng dẫn nhanh cho Admin */}
            <div className="prompt-instruction-info-box">
              <Sparkles size={20} className="info-box-sparkle" />
              <div className="info-box-content">
                <h4>Chỉ dẫn Hệ thống (System Instruction) hoạt động ra sao?</h4>
                <p>
                  Đây là những luật lệ cao nhất mà mô hình AI sẽ phải tuân thủ nghiêm ngặt trong suốt cuộc đối thoại với người dùng. Bạn có thể thay đổi cách xưng hô, chỉ định AI từ chối các câu hỏi ngoài phạm vi, hoặc huấn luyện AI tập trung vào các thói quen cụ thể.
                </p>
              </div>
            </div>

            {/* Vùng nhập nội dung Prompt */}
            <div className="prompt-field-group">
              <div className="prompt-field-header">
                <label htmlFor="ai-prompt-textarea">Nội dung chỉ dẫn hệ thống (Prompt)</label>
                <span className="char-count">{prompt.length} ký tự</span>
              </div>
              <textarea
                id="ai-prompt-textarea"
                rows={12}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Nhập hướng dẫn huấn luyện trợ lý ảo..."
                required
                disabled={isSaving}
              />
            </div>

            {/* Các nút hành động */}
            <div className="prompt-actions-footer">
              <button
                type="button"
                className="btn-prompt-reset"
                onClick={handleResetToDefault}
                disabled={isSaving}
              >
                <RotateCcw size={16} />
                <span>Khôi phục mặc định</span>
              </button>
              <button
                type="submit"
                className="btn-prompt-save"
                disabled={isSaving || !prompt.trim()}
              >
                <Save size={16} />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal xác nhận khôi phục */}
      {showResetModal && (
        <div className="prompt-modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="prompt-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="prompt-modal-header">
              <div className="prompt-modal-icon-wrapper">
                <AlertTriangle size={24} className="prompt-modal-icon" />
              </div>
              <h3>Xác nhận khôi phục</h3>
            </div>
            <div className="prompt-modal-body">
              <p>Bạn có chắc chắn muốn khôi phục Prompt chỉ dẫn về mẫu mặc định của <strong>DOPA LESS</strong>?</p>
              <p className="prompt-modal-warning-subtext">Hành động này sẽ thay thế nội dung hiện tại trong khung soạn thảo bằng nội dung mẫu chuẩn. Bạn cần nhấn "Lưu cấu hình" để áp dụng chính thức.</p>
            </div>
            <div className="prompt-modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShowResetModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn-modal-confirm"
                onClick={confirmResetToDefault}
              >
                Xác nhận khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
