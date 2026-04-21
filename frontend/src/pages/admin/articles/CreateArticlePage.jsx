import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Image as ImageIcon, 
  Bold, 
  Italic, 
  Underline, 
  List as ListIcon, 
  ListOrdered, 
  Quote, 
  AlignLeft, 
  Sigma, 
  Table as TableIcon, 
  Link as LinkIcon, 
  Type, 
  Eye, 
  Calendar, 
  Send,
  X,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateArticlePage() {
  const navigate = useNavigate();
  const [tags, setTags] = useState(['Giáo dục', 'Khoa học']);
  const [title, setTitle] = useState('');

  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      {/* Main Editor Section */}
      <div style={{ flex: 1, background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: '600' }}>
          <span>KHO LƯU TRỮ</span>
          <ChevronLeft size={14} style={{ transform: 'rotate(180deg)' }} />
          <span style={{ color: 'var(--teal-dark)' }}>TẠO BÀI BÁO NGHIÊN CỨU</span>
        </div>

        {/* Cover Image Upload Area */}
        <div style={{ 
          width: '100%', 
          height: '250px', 
          background: 'linear-gradient(135deg, #f6f8fb 0%, #f1f4f9 100%)', 
          borderRadius: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '2px dashed #e2e8f0',
          marginBottom: '2rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1rem' }}>
            <ImageIcon size={32} color="var(--teal-dark)" />
          </div>
          <p style={{ margin: 0, fontWeight: '700', color: 'var(--teal-dark)' }}>Tải lên ảnh bìa nghiên cứu</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>Tỷ lệ đề xuất 21:9 • PNG, JPG</p>
        </div>

        {/* Title Input */}
        <input 
          type="text" 
          placeholder="Tiêu đề bài nghiên cứu của bạn..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ 
            width: '100%', 
            border: 'none', 
            outline: 'none', 
            fontSize: '2.5rem', 
            fontWeight: '800', 
            color: '#2d3748',
            marginBottom: '1rem',
            fontFamily: '"Outfit", sans-serif'
          }}
        />
        <div style={{ width: '60px', height: '4px', background: '#e2e8f0', marginBottom: '2rem', borderRadius: '2px' }}></div>

        {/* Toolbar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.75rem', 
          background: '#f8fafc', 
          borderRadius: '12px', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '0.25rem', borderRight: '1px solid #e2e8f0', paddingRight: '0.5rem' }}>
            <ToolbarButton icon={<Bold size={18} />} />
            <ToolbarButton icon={<Italic size={18} />} />
            <ToolbarButton icon={<Underline size={18} />} />
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', borderRight: '1px solid #e2e8f0', paddingRight: '0.5rem' }}>
            <ToolbarButton icon={<ListIcon size={18} />} />
            <ToolbarButton icon={<ListOrdered size={18} />} />
            <ToolbarButton icon={<Quote size={18} />} />
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', borderRight: '1px solid #e2e8f0', paddingRight: '0.5rem' }}>
            <ToolbarButton icon={<AlignLeft size={18} />} />
            <ToolbarButton icon={<Sigma size={18} />} />
            <ToolbarButton icon={<TableIcon size={18} />} />
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', borderRight: '1px solid #e2e8f0', paddingRight: '0.5rem' }}>
            <ToolbarButton icon={<LinkIcon size={18} />} />
            <ToolbarButton icon={<ImageIcon size={18} />} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase' }}>Paragraph</span>
            <ChevronLeft size={14} style={{ transform: 'rotate(-90deg)' }} />
          </div>
        </div>

        {/* Content Area */}
        <textarea 
          placeholder="Bắt đầu triển khai các luận điểm và dữ liệu nghiên cứu tại đây..."
          style={{ 
            width: '100%', 
            minHeight: '400px', 
            border: 'none', 
            outline: 'none', 
            fontSize: '1.1rem', 
            lineHeight: '1.8', 
            color: '#4a5568',
            resize: 'none',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Right Sidebar - Configuration */}
      <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* SEO Card */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase' }}>Tóm tắt metadata (SEO)</h4>
          <textarea 
            placeholder="Tóm tắt ngắn gọn mục tiêu và phương pháp nghiên cứu..."
            style={{ width: '100%', height: '100px', padding: '0.75rem', borderRadius: '12px', border: '1px solid #edf2f7', outline: 'none', fontSize: '0.85rem', resize: 'none' }}
          />
          <p style={{ margin: '0.5rem 0 0 0', textAlign: 'right', fontSize: '0.7rem', color: 'var(--muted)' }}>0 / 160</p>
        </div>

        {/* URL Card */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase' }}>Định danh URL</h4>
          <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', fontSize: '0.8rem', border: '1px solid #edf2f7', color: '#4a5568' }}>
            scholarly.vn/ <span style={{ fontWeight: '700' }}>bai-nghien-cuu-so-01</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ width: '100%' }}>
          <ActionButton icon={<Eye size={18} />} label="Xem thử" fullWidth />
        </div>
        <button style={{ 
          width: '100%', 
          padding: '1rem', 
          background: '#1a1a4b', 
          color: 'white', 
          border: 'none', 
          borderRadius: '14px', 
          fontWeight: '700', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.75rem',
          cursor: 'pointer',
          boxShadow: '0 10px 20px rgba(26, 26, 75, 0.2)'
        }}>
          <Send size={18} /> XUẤT BẢN NGAY
        </button>
      </div>
    </div>
  );
}

function ToolbarButton({ icon }) {
  return (
    <button style={{ 
      background: 'none', 
      border: 'none', 
      padding: '0.5rem', 
      borderRadius: '8px', 
      cursor: 'pointer', 
      color: '#4a5568',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = '#edf2f7'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
    >
      {icon}
    </button>
  );
}

function ActionButton({ icon, label, fullWidth }) {
  return (
    <button style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '0.5rem', 
      padding: '0.75rem', 
      background: 'white', 
      border: '1px solid #edf2f7', 
      borderRadius: '12px', 
      fontSize: '0.85rem', 
      fontWeight: '700',
      cursor: 'pointer',
      width: fullWidth ? '100%' : 'auto'
    }}>
      {icon} {label}
    </button>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}
