import React from 'react';
import './QuizRenderer.css';
import { HelpCircle, MessageSquare, CheckCircle2 } from 'lucide-react';

const QuizRenderer = ({ quiz, isPreview = false }) => {
  if (!quiz) return null;

  return (
    <div className={`quiz-renderer ${isPreview ? 'is-preview' : ''}`}>
      <header className="quiz-header">
        <div className="quiz-banner">
          <img src={quiz.imageUrl || 'https://images.unsplash.com/photo-1510070112810-d4e9a46d9e91?q=80&w=2069&auto=format&fit=crop'} alt={quiz.title} />
        </div>
        <div className="quiz-info">
          <h1>{quiz.title || 'Tiêu đề bài test'}</h1>
          <p className="description">{quiz.description || 'Chưa có mô tả...'}</p>
          
          <div className="quiz-stats">
            <div className="stat-item">
              <HelpCircle size={18} />
              <span>{quiz.questions?.length || 0} câu hỏi</span>
            </div>
            <div className="stat-item">
              <MessageSquare size={18} />
              <span>Phản hồi tự động</span>
            </div>
          </div>
        </div>
      </header>

      <div className="quiz-body">
        <h2 className="section-title">Nội dung câu hỏi</h2>
        <div className="questions-list">
          {quiz.questions?.map((q, idx) => (
            <div key={q.id || idx} className="question-card">
              <div className="question-header">
                <span className="q-index">Câu hỏi {idx + 1}</span>
                <span className={`q-type ${q.type}`}>{q.type === 'SINGLE_CHOICE' ? 'Chọn một' : 'Chọn nhiều'}</span>
              </div>
              <h3 className="q-content">{q.content || '(Chưa nhập nội dung câu hỏi)'}</h3>
              
              <div className="answers-grid">
                {q.answers?.map((a, aIdx) => (
                  <div key={a.id || aIdx} className="answer-item">
                    <div className="answer-content">
                      <div className={`custom-indicator ${q.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}`}></div>
                      <span className="text">{a.content || '(Đáp án trống)'}</span>
                    </div>
                    {a.feedbackText && (
                      <div className="answer-feedback">
                        <CheckCircle2 size={14} className="feedback-icon" />
                        <span dangerouslySetInnerHTML={{ __html: a.feedbackText }}></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="assessment-section">
          <h2 className="section-title">Nhận xét tổng thể sau bài test</h2>
          <div className="assessment-content" dangerouslySetInnerHTML={{ __html: quiz.overallAssessment || 'Cảm ơn bạn đã tham gia bài test.' }}></div>
        </div>
      </div>
    </div>
  );
};

export default QuizRenderer;
