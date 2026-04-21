import React, { useState } from 'react';
import { 
  Eye, 
  Send, 
  Info, 
  ChevronDown, 
  FileUp, 
  Copy, 
  Trash2, 
  Plus,
  HelpCircle,
  Clock,
  Target,
  Image as ImageIcon
} from 'lucide-react';

export default function CreateQuizPage() {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      content: 'Ngôn ngữ lập trình nào sau đây được sử dụng chính để phát triển Android?',
      options: [
        { id: 'a', text: 'Kotlin', isCorrect: true },
        { id: 'b', text: 'Swift', isCorrect: false },
        { id: 'c', text: 'PHP', isCorrect: false }
      ],
      explanation: ''
    }
  ]);

  const [timeLimit, setTimeLimit] = useState(30);
  const [passingScore, setPassingScore] = useState(80);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#1a1a4b' }}>Trình tạo câu hỏi trắc nghiệm</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>Xây dựng bài kiểm tra đánh giá chất lượng cho khóa học của bạn</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.75rem 1.25rem', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0', 
            background: 'white', 
            fontWeight: '700', 
            color: '#1a1a4b',
            cursor: 'pointer'
          }}>
            <Eye size={18} /> Xem trước
          </button>
          <button style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.75rem 1.25rem', 
            borderRadius: '12px', 
            border: 'none', 
            background: '#1a1a4b', 
            fontWeight: '700', 
            color: 'white',
            cursor: 'pointer'
          }}>
            <Send size={18} /> Xuất bản
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Basic Info Section */}
          <section style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f0f4ff', color: '#1a1a4b', padding: '0.5rem', borderRadius: '10px' }}>
                <Info size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Thông tin cơ bản</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '0.5rem' }}>Tiêu đề bài trắc nghiệm</label>
                <input 
                  type="text" 
                  placeholder="Nhập tiêu đề hấp dẫn..." 
                  style={{ width: '100%', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid #edf2f7', outline: 'none', background: '#f8fafc' }}
                />
              </div>
            </div>
          </section>

          {/* Questions Section */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#f0f4ff', color: '#1a1a4b', padding: '0.5rem', borderRadius: '10px' }}>
                   <HelpCircle size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Câu hỏi ({questions.length})</h3>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1a1a4b', fontWeight: '700', fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                <FileUp size={18} /> Nhập từ file
              </button>
            </div>

            {questions.map((q, idx) => (
              <div key={q.id} style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #edf2f7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ background: '#f0f4ff', color: '#4361ee', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Câu hỏi 0{idx + 1}</span>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><Copy size={18} /></button>
                    <button style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer' }}><Trash2 size={18} /></button>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '0.5rem' }}>Nội dung câu hỏi</label>
                  <textarea 
                    defaultValue={q.content}
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #edf2f7', outline: 'none', background: '#f8fafc', minHeight: '80px', resize: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '1rem' }}>Các phương án trả lời</label>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {q.options.map(opt => (
                        <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            width: '20px', 
                            height: '20px', 
                            borderRadius: '50%', 
                            border: opt.isCorrect ? '6px solid #1a1a4b' : '2px solid #cbd5e0',
                            background: 'white'
                          }}></div>
                          <input 
                            type="text" 
                            defaultValue={opt.text}
                            style={{ 
                              flex: 1, 
                              padding: '0.75rem 1rem', 
                              borderRadius: '10px', 
                              border: opt.isCorrect ? '1px solid #c6f6d5' : '1px solid #edf2f7', 
                              background: opt.isCorrect ? '#f0fff4' : 'white',
                              outline: 'none'
                            }} 
                          />
                          {opt.isCorrect && <span style={{ color: '#38a169', fontSize: '0.7rem', fontWeight: '800' }}>ĐÚNG</span>}
                        </div>
                      ))}
                   </div>
                   <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1a1a4b', fontWeight: '700', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
                    <Plus size={16} /> Thêm phương án
                  </button>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                   <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '0.5rem' }}>Giải thích đáp án (Tùy chọn)</label>
                   <textarea 
                    placeholder="Giải thích tại sao đáp án này đúng..."
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #edf2f7', outline: 'none', background: '#f8fafc', minHeight: '60px', resize: 'none' }}
                  />
                </div>

                <button style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  background: '#f0f4ff', 
                  color: '#1a1a4b', 
                  border: '1px dashed #4361ee', 
                  borderRadius: '14px', 
                  fontWeight: '700', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}>
                  <Plus size={18} /> Thêm câu hỏi
                </button>
              </div>
            ))}
          </section>

        </div>

        {/* Right Sidebar */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Cover Image Upload */}
          <section style={{ background: 'white', padding: '1rem', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '100%', height: '140px', background: '#f1f5f9', borderRadius: '14px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
              <img 
                src="https://images.unsplash.com/photo-1510070112810-d4e9a46d9e91?q=80&w=2069&auto=format&fit=crop" 
                alt="Quiz Cover" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
              />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <ImageIcon size={20} color="#1a1a4b" />
              </div>
            </div>
            <div style={{ padding: '0.75rem 0.25rem' }}>
              <h5 style={{ margin: 0, fontSize: '0.8rem', fontWeight: '800', color: '#1a1a4b' }}>Ảnh đại diện bài thi</h5>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '500' }}>Định dạng JPG, PNG. Kích thước tối ưu 1200x630px.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
