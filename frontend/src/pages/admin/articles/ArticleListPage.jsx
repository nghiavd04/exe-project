import React from 'react';
import { Plus, Search, Edit2, Trash2, Eye, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_ARTICLES = [
  { id: 1, title: 'Tại sao chúng ta nghiện mạng xã hội?', author: 'Admin', category: 'Tâm lý', date: '2024-04-20', views: 1250, status: 'Published' },
  { id: 2, title: '10 cách để detox dopamine hiệu quả', author: 'Dr. Smith', category: 'Sức khỏe', date: '2024-04-18', views: 840, status: 'Published' },
  { id: 3, title: 'Ảnh hưởng của ánh sáng xanh đến giấc ngủ', author: 'Admin', category: 'Sức khỏe', date: '2024-04-22', views: 0, status: 'Draft' },
];

export default function ArticleListPage() {
  return (
    <div className="admin-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: 'var(--teal-dark)' }}>Quản lý Bài viết</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Quản lý nội dung blog và kiến thức chia sẻ.</p>
        </div>
        <Link to="/admin/articles/create" style={{ textDecoration: 'none' }}>
          <button style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'var(--teal-dark)', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.25rem', 
            borderRadius: '10px', 
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(45, 106, 79, 0.2)'
          }}>
            <Plus size={20} /> Viết Bài Mới
          </button>
        </Link>
      </header>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Tổng bài viết', value: '42', icon: <FileText size={20} />, color: '#4299e1' },
          { label: 'Lượt xem tháng này', value: '12.5k', icon: <Eye size={20} />, color: '#48bb78' },
          { label: 'Bài viết chờ duyệt', value: '5', icon: <Calendar size={20} />, color: '#f6ad55' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: `${stat.color}15`, color: stat.color, padding: '0.75rem', borderRadius: '12px' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '500' }}>{stat.label}</p>
              <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--teal-dark)' }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Article List */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between' }}>
           <div style={{ position: 'relative', width: '300px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={16} />
            <input type="text" placeholder="Tìm bài viết..." style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '8px', border: '1px solid #edf2f7', outline: 'none' }} />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
              <th style={{ padding: '1rem 1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Tiêu đề</th>
              <th style={{ padding: '1rem 1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Tác giả</th>
              <th style={{ padding: '1rem 1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Danh mục</th>
              <th style={{ padding: '1rem 1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Ngày đăng</th>
              <th style={{ padding: '1rem 1.25rem', color: 'var(--muted)', fontWeight: '600' }}>Trạng thái</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ARTICLES.map((art) => (
              <tr key={art.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: '600', color: 'var(--teal-dark)' }}>{art.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Eye size={12} /> {art.views} lượt xem
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>{art.author}</td>
                <td style={{ padding: '1.25rem' }}>{art.category}</td>
                <td style={{ padding: '1.25rem' }}>{art.date}</td>
                <td style={{ padding: '1.25rem' }}>
                   <span style={{ 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '6px', 
                    fontSize: '0.8rem', 
                    fontWeight: '600',
                    background: art.status === 'Published' ? '#ebf8ff' : '#edf2f7',
                    color: art.status === 'Published' ? '#3182ce' : '#718096'
                  }}>
                    {art.status}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                    <button style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer' }}><Trash2 size={16} /></button>
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
