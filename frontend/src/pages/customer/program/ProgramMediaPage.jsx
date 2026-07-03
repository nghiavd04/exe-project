import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Lock, ShieldAlert, Sparkles, 
  ChevronLeft, ChevronRight, Music, Film, PlayCircle, ExternalLink, HelpCircle
} from 'lucide-react';
import { useProgram } from './ProgramLayout';
import { programApi } from '../../../apis/customerApi';
import toast from 'react-hot-toast';
import './ProgramMediaPage.css';

// Thẻ xem trước Audio gọn gàng (Premium UI/UX)
function AudioPreviewCard({ item, onStart }) {
  return (
    <div className="media-card audio-preview-card" onClick={onStart}>
      <div className="audio-thumbnail-container">
        <div className="audio-waves-visual">
          <div className="wave-line"></div>
          <div className="wave-line"></div>
          <div className="wave-line"></div>
          <div className="wave-line"></div>
          <div className="wave-line"></div>
        </div>
        <div className="audio-disc-preview">
          <Music size={24} />
        </div>
      </div>
      <div className="media-info" style={{ padding: '20px' }}>
        <div className="media-card-tag">
          {item.dayNumber !== null ? `Ngày ${item.dayNumber}` : 'Tài nguyên chung'} • {item.mediaType === 'PODCAST' ? 'Podcast chia sẻ' : 'Âm thanh thiền định'}
        </div>
        <h3 className="media-card-title">{item.title}</h3>
        <p className="media-card-desc">{item.description}</p>
        <button className="btn-start-audio" onClick={(e) => { e.stopPropagation(); onStart(); }}>
          <Play size={12} fill="currentColor" style={{ marginRight: '6px' }} />
          Bắt đầu nghe
        </button>
      </div>
    </div>
  );
}

// Modal trình phát âm thanh chánh niệm (Immersive Audio Player Modal)
function AudioPlayerModal({ item, onClose }) {
  const [playing, setPlaying] = useState(true); // Tự động phát khi mở
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        setPlaying(false);
      });
    }
  }, []);

  const togglePlay = () => {
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleAudioEnded = () => {
    setPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="audio-modal-overlay" onClick={onClose}>
      <div className="audio-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="audio-modal-close" onClick={onClose}>
          ✕
        </button>
        <audio 
          ref={audioRef} 
          src={item.mediaUrl} 
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />
        
        <div className="audio-modal-player-card">
          <div className="audio-modal-disc-container">
            <div className={`audio-modal-disc ${playing ? 'rotating' : ''}`}>
              <div className="audio-disc-center"></div>
              <Music size={36} className="audio-modal-disc-icon" />
            </div>
            {/* Sóng equalizer nhảy theo nhạc */}
            <div className="audio-modal-equalizer">
              <div className={`equalizer-bar ${playing ? 'animating' : ''}`}></div>
              <div className={`equalizer-bar ${playing ? 'animating' : ''}`}></div>
              <div className={`equalizer-bar ${playing ? 'animating' : ''}`}></div>
              <div className={`equalizer-bar ${playing ? 'animating' : ''}`}></div>
              <div className={`equalizer-bar ${playing ? 'animating' : ''}`}></div>
            </div>
          </div>

          <div className="audio-modal-info">
            <div className="audio-modal-tag">
              {item.dayNumber !== null ? `Ngày ${item.dayNumber}` : 'Tài nguyên chung'} • {item.mediaType}
            </div>
            <h2 className="audio-modal-title">{item.title}</h2>
            <p className="audio-modal-desc">{item.description}</p>
          </div>

          <div className="audio-modal-controls">
            <div className="audio-modal-seekbar-wrapper">
              <div className="audio-modal-time-row">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input 
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="audio-modal-seekbar"
              />
            </div>

            <button className="btn-audio-modal-play-pause" onClick={togglePlay}>
              {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Thẻ xem trước Video gọn gàng với nút Bắt đầu (Premium UI/UX)
function VideoPreviewCard({ item, onStart }) {
  const getYoutubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = item.mediaUrl ? getYoutubeId(item.mediaUrl) : null;
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  return (
    <div className="media-card video-preview-card" onClick={onStart}>
      <div className="video-thumbnail-container">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={item.title} className="video-thumbnail-img" />
        ) : (
          <div className="video-thumbnail-fallback">
            <Film size={28} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '4px' }}>Dopaless Video</span>
          </div>
        )}
        <div className="video-play-overlay">
          <div className="play-circle-btn">
            <Play size={18} fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="media-info" style={{ padding: '20px' }}>
        <div className="media-card-tag">
          {item.dayNumber !== null ? `Ngày ${item.dayNumber}` : 'Tài nguyên chung'} • Video bài giảng
        </div>
        <h3 className="media-card-title">{item.title}</h3>
        <p className="media-card-desc">{item.description}</p>
        <button className="btn-start-video" onClick={(e) => { e.stopPropagation(); onStart(); }}>
          <Play size={12} fill="currentColor" style={{ marginRight: '6px' }} />
          Bắt đầu học
        </button>
      </div>
    </div>
  );
}

// Thẻ tài nguyên bị khóa (Locked Card)
function LockedMediaCard({ item, onUpgradeRedirect }) {
  return (
    <div className="media-card locked-card">
      <div className="locked-overlay">
        <div className="lock-icon-box">
          <Lock size={22} className="lock-icon" />
        </div>
        <div className="lock-details">
          <h4>Gói {item.targetTier} yêu cầu</h4>
          <p>Hãy nâng cấp gói dịch vụ để mở khóa nội dung này ngay.</p>
          <button className="btn-locked-upgrade" onClick={onUpgradeRedirect}>
            Kích hoạt gói ngay
          </button>
        </div>
      </div>

      <div className="media-card-top" style={{ opacity: 0.25, pointerEvents: 'none' }}>
        <div className="audio-disc-wrapper">
          <div className="audio-disc">
            {item.mediaType === 'AUDIO' ? <Music size={18} /> : item.mediaType === 'VIDEO' ? <Film size={18} /> : <PlayCircle size={18} />}
          </div>
        </div>
        <div className="media-info">
          <div className="media-card-tag">Ngày {item.dayNumber || 'Chung'} • {item.mediaType}</div>
          <h3 className="media-card-title">{item.title}</h3>
          <p className="media-card-desc">{item.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function ProgramMediaPage() {
  const navigate = useNavigate();
  const { userProgress } = useProgram();
  
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeAudio, setActiveAudio] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    document.title = 'Thư viện Thiền & Podcast – Dopaless';
  }, []);

  useEffect(() => {
    fetchMedias();
  }, [page, activeTab]);

  const fetchMedias = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        type: activeTab !== 'ALL' ? activeTab : undefined
      };
      const response = await programApi.getProgramMedias(params);
      if (response.data.success) {
        setMedias(response.data.data.content || []);
        setTotalPages(response.data.data.totalPages || 0);
        setPageSize(response.data.data.size || 10);
      }
    } catch (err) {
      toast.error('Không thể tải tài nguyên đa phương tiện');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeRedirect = () => {
    navigate('/goi-dich-vu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tabs = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'AUDIO', label: '🧘 Thiền & Nhạc' },
    { key: 'PODCAST', label: '🎙️ Podcast' },
    { key: 'VIDEO', label: '🎥 Video động lực' }
  ];

  // Removed client side filter

  const totalDays = userProgress?.durationDays || 120;
  const progressPct = Math.round(((userProgress?.currentDay || 0) / totalDays) * 100);

  return (
    <div className="pd-page">
      <div className="pd-roadmap-hero media-hero">
        <div className="pd-roadmap-hero-inner">
          <div className="pd-roadmap-hero-left">
            <div className="pd-roadmap-hero-badge">🎧 THƯ VIỆN HỖ TRỢ</div>
            <h1 className="pd-roadmap-hero-title">Âm Thanh Chánh Niệm &amp; Podcast</h1>
            <p className="pd-roadmap-hero-desc">
              Hỗ trợ tối ưu hóa não bộ, vượt qua những thôi thúc khó chịu và kích thích phục hồi thụ thể dopamine tự nhiên thông qua chánh niệm, âm nhạc tần số cao và tri thức khoa học hành vi.
            </p>
            <button 
              className="pd-roadmap-hero-cta btn-back-roadmap" 
              onClick={() => {
                navigate('/phac-do');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              ← Xem Lộ trình {totalDays} Ngày
            </button>
          </div>
          <div className="pd-roadmap-hero-right-badge media-right-badge">
            <div className="pd-badge-icon">🧘</div>
            <div className="pd-badge-label">Tần số</div>
            <div className="pd-badge-val">528 Hz</div>
          </div>
        </div>
      </div>

      <div className="pd-content">
        <div className="pd-main">
          {/* Tabs Filter */}
          <div className="media-tabs-bar">
            {tabs.map(tab => (
              <button 
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setPage(0); }}
                className={`media-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Media Grid */}
          {loading ? (
            <div className="media-loading-box">
              <div className="plans-loader"></div>
              <p>Đang tải tài nguyên âm thanh & video...</p>
            </div>
          ) : medias.length === 0 ? (
            <div className="media-empty-box">
              <Music size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>Chưa có tài nguyên nào trong mục này.</p>
            </div>
          ) : (
            <div className="media-cards-layout-grid">
              {medias.map(item => {
                if (item.locked) {
                  return (
                    <LockedMediaCard 
                      key={item.id} 
                      item={item} 
                      onUpgradeRedirect={handleUpgradeRedirect} 
                    />
                  );
                }

                if (item.mediaType === 'VIDEO') {
                  return (
                    <VideoPreviewCard 
                      key={item.id} 
                      item={item} 
                      onStart={() => setActiveVideo(item)} 
                    />
                  );
                }

                // Default audio player (AUDIO or PODCAST)
                if (item.mediaType === 'PODCAST' && item.mediaUrl && (item.mediaUrl.includes('youtube.com') || item.mediaUrl.includes('youtu.be'))) {
                  return (
                    <VideoPreviewCard 
                      key={item.id} 
                      item={{ ...item, mediaType: 'PODCAST (Youtube)' }} 
                      onStart={() => setActiveVideo(item)} 
                    />
                  );
                }
                return (
                  <AudioPreviewCard 
                    key={item.id} 
                    item={item} 
                    onStart={() => setActiveAudio(item)} 
                  />
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="pagination-container" style={{ marginTop: '2rem', justifyContent: 'center' }}>
              <button 
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="pagination-arrow"
              >
                <ChevronLeft size={20} />
              </button>

              {(() => {
                const pages = [];
                const maxVisible = 5;
                let start = Math.max(0, page - 2);
                let end = Math.min(totalPages - 1, start + maxVisible - 1);
                
                if (end - start < maxVisible - 1) {
                  start = Math.max(0, end - maxVisible + 1);
                }

                if (start > 0) {
                  pages.push(
                    <button key={0} onClick={() => setPage(0)} className="pagination-btn">1</button>
                  );
                  if (start > 1) pages.push(<span key="sp1" style={{ color: 'var(--muted)', padding: '0 0.5rem' }}>...</span>);
                }

                for (let i = start; i <= end; i++) {
                  pages.push(
                    <button 
                      key={i} 
                      onClick={() => setPage(i)}
                      className={`pagination-btn ${page === i ? 'active' : ''}`}
                    >
                      {i + 1}
                    </button>
                  );
                }

                if (end < totalPages - 1) {
                  if (end < totalPages - 2) pages.push(<span key="sp2" style={{ color: 'var(--muted)', padding: '0 0.5rem' }}>...</span>);
                  pages.push(
                    <button key={totalPages - 1} onClick={() => setPage(totalPages - 1)} className="pagination-btn">
                      {totalPages}
                    </button>
                  );
                }

                return pages;
              })()}

              <button 
                disabled={page === totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="pagination-arrow"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="pd-sidebar">
          <div className="pd-roadmap-progress-card">
            <div className="pd-roadmap-progress-header">
              <span className="pd-roadmap-progress-icon">🎯</span>
              <div>
                <span className="pd-roadmap-progress-title">Tiến Trình Tổng</span>
                <span className="pd-roadmap-progress-sub">{userProgress?.protocolName || 'Giải Độc Dopamine'}</span>
              </div>
            </div>
            <div className="pd-roadmap-progress-body">
              <div className="pd-roadmap-progress-number">Ngày {userProgress?.currentDay || 0} / {totalDays}</div>
              <div className="pd-roadmap-progress-bar-wrap">
                <div className="pd-roadmap-progress-bar-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="pd-roadmap-progress-footer">
                <span>Tiến trình hoàn thành</span>
                <span style={{ color: 'var(--teal)' }}>{progressPct}%</span>
              </div>
            </div>
          </div>

          <div className="media-guide-card">
            <HelpCircle size={20} className="guide-icon" />
            <h4>Hướng dẫn sử dụng</h4>
            <p>
              Các bài thiền và podcast được lập trình khớp với nhịp sinh học và tâm lý học từng giai đoạn của lộ trình detox dopamine. Hãy sử dụng đều đặn để làm dịu các cơn lo lắng và xây dựng thói quen chánh niệm dài hạn.
            </p>
          </div>
        </div>
      </div>

      {/* Video Immersive Player Modal */}
      {activeVideo && (
        <div className="video-modal-overlay" onClick={() => setActiveVideo(null)}>
          <div className="video-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={() => setActiveVideo(null)}>
              ✕
            </button>
            <div className="video-modal-player-wrapper">
              {activeVideo.mediaUrl && (activeVideo.mediaUrl.includes('youtube.com') || activeVideo.mediaUrl.includes('youtu.be')) ? (
                (() => {
                  const getYoutubeId = (url) => {
                    if (!url) return '';
                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                    const match = url.match(regExp);
                    return (match && match[2].length === 11) ? match[2] : null;
                  };
                  const vId = getYoutubeId(activeVideo.mediaUrl);
                  return vId ? (
                    <iframe 
                      src={`https://www.youtube.com/embed/${vId}?autoplay=1`}
                      title={activeVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="modal-youtube-iframe"
                    />
                  ) : (
                    <div className="youtube-error-placeholder">
                      <ShieldAlert size={36} />
                      <span>Link Youtube không đúng định dạng.</span>
                    </div>
                  );
                })()
              ) : (
                <video src={activeVideo.mediaUrl} controls autoPlay className="modal-html5-player" />
              )}
            </div>
            <div className="video-modal-info">
              <div className="video-modal-tag">
                {activeVideo.dayNumber !== null ? `Ngày ${activeVideo.dayNumber}` : 'Tài nguyên chung'} • {activeVideo.mediaType}
              </div>
              <h2 className="video-modal-title">{activeVideo.title}</h2>
              <p className="video-modal-desc">{activeVideo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Audio Immersive Player Modal */}
      {activeAudio && (
        <AudioPlayerModal 
          item={activeAudio} 
          onClose={() => setActiveAudio(null)} 
        />
      )}
    </div>
  );
}
