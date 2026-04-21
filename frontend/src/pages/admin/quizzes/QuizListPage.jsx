import React from 'react';
import { Plus, Search, Edit2, Trash2, MoreVertical, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_QUIZZES = [
  { id: 1, title: 'Kiến thức cơ bản về Dopamine', questions: 10, category: 'Sức khỏe', status: 'Active', completions: 124 },
  { id: 2, title: 'Thói quen sử dụng Internet', questions: 15, category: 'Hành vi', status: 'Draft', completions: 0 },
  { id: 3, title: 'Cân bằng cuộc sống và công nghệ', questions: 12, category: 'Tâm lý', status: 'Active', completions: 89 },
];

export default function QuizListPage() {
  return (
    <div className="admin-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: 'var(--teal-dark)' }}>Quản lý Quizzes</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Xem và quản lý tất cả các bài kiểm tra trong hệ thống.</p>
        </div>
        <Link to="/admin/quizzes/create" style={{ textDecoration: 'none' }}>
          <button style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'var(--accent)', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.25rem', 
            borderRadius: '10px', 
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(246, 173, 85, 0.3)'
          }}>
            <Plus size={20} /> Tạo Quiz Mới
          </button>
        </Link>
      </header>

      {/* Filters & Search */}
      <div style={{ 
        background: 'white', 
        padding: '1.25rem', 
        borderRadius: '16px', 
        marginBottom: '1.5rem', 
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', width: '350px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm bài test..." 
            style={{ 
              width: '100%', 
              padding: '0.6rem 1rem 0.6rem 2.5rem', 
              borderRadius: '8px', 
              border: '1px solid #edf2f7', 
              outline: 'none',
              fontSize: '0.95rem'
            }} 
          />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #edf2f7', background: '#f8fafc' }}><LayoutGrid size={18} /></button>
          <button style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #edf2f7', background: 'white' }}><List size={18} /></button>
        </div>
      </div>

      {/* Quiz Table */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Tên bài test</th>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Chủ đề</th>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Số câu hỏi</th>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Trạng thái</th>
              <th style={{ padding: '1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Lượt làm</th>
              <th style={{ padding: '1.25rem', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_QUIZZES.map((quiz) => (
              <tr key={quiz.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                <td style={{ padding: '1.25rem', fontWeight: '600', color: 'var(--teal-dark)' }}>{quiz.title}</td>
                <td style={{ padding: '1.25rem' }}>{quiz.category}</td>
                <td style={{ padding: '1.25rem' }}>{quiz.questions}</td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem', 
                    fontWeight: '600',
                    background: quiz.status === 'Active' ? '#e6fffa' : '#fff5f5',
                    color: quiz.status === 'Active' ? '#319795' : '#e53e3e'
                  }}>
                    {quiz.status}
                  </span>
                </td>
                <td style={{ padding: '1.25rem' }}>{quiz.completions}</td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button style={{ p: '0.4rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={16} /></button>
                    <button style={{ p: '0.4rem', color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    <button style={{ p: '0.4rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}><MoreVertical size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
