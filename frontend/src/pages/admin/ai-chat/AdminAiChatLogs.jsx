import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../../apis/adminApi';
import { useAuth } from '../../../hooks/AuthContext';
import { Client } from '@stomp/stompjs';
import { 
  Search, Eye, MessageSquare, Calendar, User, 
  X, ChevronLeft, ChevronRight, Bot, Sparkles, AlertCircle, Send
} from 'lucide-react';
import './AdminAiChatLogs.css';

export default function AdminAiChatLogs() {
  const { user: currentAdmin } = useAuth();
  
  // Tab State
  const [activeTab, setActiveTab] = useState('AI'); // 'AI' hoặc 'SUPPORT'
  
  // Tab 1: AI Chat Logs states
  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // States for Chat Transcript Modal (AI Chat)
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState('');

  // Tab 2: Live Support Console states
  const [selectedSession, setSelectedSession] = useState(null);
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportInputText, setSupportInputText] = useState('');
  const [isSendingSupport, setIsSendingSupport] = useState(false);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch sessions on dependencies change
  useEffect(() => {
    fetchSessions();
  }, [page, searchQuery, activeTab]);

  // Scroll support chat to bottom on new messages
  useEffect(() => {
    if (activeTab === 'SUPPORT') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [supportMessages]);

  // WebSocket connection effect for support chat room
  useEffect(() => {
    if (selectedSession && activeTab === 'SUPPORT') {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
      let brokerURL = '';
      if (baseUrl.startsWith('http')) {
        const wsProto = baseUrl.startsWith('https') ? 'wss' : 'ws';
        const host = baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
        brokerURL = `${wsProto}://${host}/ws-chat`;
      } else {
        const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws';
        brokerURL = `${wsProto}://${window.location.host}${baseUrl}/ws-chat`;
      }

      const client = new Client({
        brokerURL,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {
        client.subscribe(`/topic/chat/${selectedSession.id}`, (message) => {
          const body = JSON.parse(message.body);
          
          if (body.eventType === 'ASSIGNMENT_UPDATE') {
            // Cập nhật session đang chọn
            setSelectedSession(prev => {
              if (prev && prev.id === body.sessionId) {
                return {
                  ...prev,
                  assignedTo: body.assignedTo && body.assignedTo.id ? body.assignedTo : null
                };
              }
              return prev;
            });
            
            // Cập nhật session tương ứng trong danh sách sidebar
            setSessions(prevList => prevList.map(s => {
              if (s.id === body.sessionId) {
                return {
                  ...s,
                  assignedTo: body.assignedTo && body.assignedTo.id ? body.assignedTo : null
                };
              }
              return s;
            }));
          } else {
            setSupportMessages(prev => {
              if (prev.some(m => m.id === body.id)) {
                return prev;
              }
              return [...prev, body];
            });
          }
        });
      };

      client.onStompError = (frame) => {
        console.error('STOMP connection error:', frame.headers['message']);
      };

      client.activate();
      stompClientRef.current = client;

      return () => {
        if (stompClientRef.current) {
          stompClientRef.current.deactivate();
        }
      };
    }
  }, [selectedSession?.id, activeTab]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const params = {
        page,
        size: activeTab === 'SUPPORT' ? 100 : 8, // Lấy nhiều hơn đối với support console
        search: searchQuery || undefined,
        type: activeTab
      };
      const res = await adminApi.getAiChatSessions(params);
      if (res.data.success) {
        setSessions(res.data.data.content || []);
        setTotalPages(res.data.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Lỗi khi tải lịch sử phiên chat:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(0);
    setSearchQuery('');
    setSearchInput('');
    setSelectedSession(null);
    setSupportMessages([]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    setSearchQuery(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(0);
  };

  // Tab 1: Transcript Modal
  const handleViewTranscript = async (session) => {
    setActiveSession(session);
    setMessages([]);
    setIsLoadingMessages(true);
    setMessageError('');

    try {
      const res = await adminApi.getAiChatMessages(session.id);
      if (res.data.success) {
        setMessages(res.data.data || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải lịch sử tin nhắn:', err);
      setMessageError('Không thể tải lịch sử tin nhắn của cuộc trò chuyện này.');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleCloseModal = () => {
    setActiveSession(null);
    setMessages([]);
  };

  // Tab 2: Live Support Console operations
  const handleSelectSupportSession = async (session) => {
    setSelectedSession(session);
    setSupportMessages([]);
    setSupportInputText('');

    try {
      const msgRes = await adminApi.getAiChatMessages(session.id);
      if (msgRes.data.success) {
        setSupportMessages(msgRes.data.data || []);
      }

      // Tự động gán (claim) phòng chat cho bản thân nếu chưa có ai gán
      if (!session.assignedTo) {
        const claimRes = await adminApi.claimSession(session.id);
        if (claimRes.data.success) {
          const updatedSession = claimRes.data.data;
          setSelectedSession(updatedSession);
          setSessions(prev => prev.map(s => s.id === session.id ? updatedSession : s));
        }
      }
    } catch (err) {
      console.error('Lỗi khi tiếp nhận phòng hỗ trợ:', err);
    }
  };

  const handleClaimSession = async (sessionId) => {
    try {
      const res = await adminApi.claimSession(sessionId);
      if (res.data.success) {
        const updatedSession = res.data.data;
        setSelectedSession(updatedSession);
        setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
      }
    } catch (err) {
      console.error('Lỗi khi nhận hỗ trợ:', err);
    }
  };

  const handleTakeoverSession = async (sessionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn tiếp quản cuộc trò chuyện này từ nhân viên khác không?')) {
      return;
    }
    try {
      const res = await adminApi.takeoverSession(sessionId);
      if (res.data.success) {
        const updatedSession = res.data.data;
        setSelectedSession(updatedSession);
        setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
        
        // Tải lại tin nhắn để hiển thị câu báo của hệ thống
        const msgRes = await adminApi.getAiChatMessages(sessionId);
        if (msgRes.data.success) {
          setSupportMessages(msgRes.data.data || []);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tiếp quản phòng chat:', err);
    }
  };

  const handleSendSupportMessage = async (e) => {
    e.preventDefault();
    if (!supportInputText.trim() || isSendingSupport || !selectedSession) return;

    const textToSend = supportInputText.trim();
    setSupportInputText('');
    setIsSendingSupport(true);

    try {
      const res = await adminApi.sendAdminMessage(selectedSession.id, textToSend);
      if (res.data.success) {
        const newMsg = res.data.data;
        setSupportMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) {
            return prev;
          }
          return [...prev, newMsg];
        });
      }
    } catch (err) {
      console.error('Lỗi khi gửi tin nhắn hỗ trợ:', err);
      alert(err.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng kiểm tra lại!');
    } finally {
      setIsSendingSupport(false);
    }
  };

  // Helper format date time
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper format message content (basic markdown formatting)
  const formatMessageContent = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      let isBullet = false;
      let content = line;
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        isBullet = true;
        content = line.trim().substring(2);
      }
      
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const formattedContent = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={lineIdx} className="admin-chat-bullet-item">
            {formattedContent}
          </li>
        );
      }
      return (
        <p key={lineIdx} className="admin-chat-paragraph">
          {formattedContent}
        </p>
      );
    });
  };

  return (
    <div className="admin-chat-logs-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Chat & Hỗ trợ</h1>
          <p className="admin-page-subtitle">
            Cấu hình prompt, xem lịch sử trao đổi của AI hoặc tham gia chat trực tiếp để hỗ trợ người dùng trực tuyến.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-chat-tabs">
        <button 
          type="button" 
          className={`admin-chat-tab-btn ${activeTab === 'AI' ? 'active' : ''}`}
          onClick={() => handleTabChange('AI')}
        >
          <Bot size={18} />
          <span>Lịch sử Chat AI</span>
        </button>
        <button 
          type="button" 
          className={`admin-chat-tab-btn ${activeTab === 'SUPPORT' ? 'active' : ''}`}
          onClick={() => handleTabChange('SUPPORT')}
        >
          <User size={18} />
          <span>Hỗ trợ Trực tuyến (Real-time)</span>
        </button>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'SUPPORT' ? (
        /* live Support Console view */
        <div className="admin-support-console">
          {/* Left Sidebar */}
          <div className="console-sidebar">
            <div className="console-sidebar-header">
              Danh sách yêu cầu ({sessions.length})
            </div>
            <div className="console-sessions-list">
              {sessions.map((s) => {
                const isMe = s.assignedTo?.email === currentAdmin?.email;
                const isOther = s.assignedTo && !isMe;
                return (
                  <div 
                    key={s.id} 
                    className={`console-session-item ${selectedSession?.id === s.id ? 'active' : ''}`}
                    onClick={() => handleSelectSupportSession(s)}
                  >
                    <span className="console-session-email">
                      {s.user?.email || 'Khách hàng ẩn danh'}
                    </span>
                    <span className="console-session-title">
                      {s.title}
                    </span>
                    <div className="console-session-meta">
                      <span>{formatDateTime(s.updatedAt)}</span>
                      {!s.assignedTo ? (
                        <span className="console-session-assignee unassigned">Chưa gán</span>
                      ) : isMe ? (
                        <span className="console-session-assignee me">Bạn hỗ trợ</span>
                      ) : (
                        <span className="console-session-assignee other" title={s.assignedTo.email}>Đã gán</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {sessions.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Không có phiên hỗ trợ nào.
                </div>
              )}
            </div>
          </div>

          {/* Right Chat Pane */}
          <div className="console-chat-pane">
            {!selectedSession ? (
              <div className="console-pane-empty">
                <MessageSquare size={48} />
                <p>Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu hỗ trợ trực tuyến.</p>
              </div>
            ) : (
              <>
                {/* Pane Header */}
                <div className="console-pane-header">
                  <div className="console-pane-user-info">
                    <h4>{selectedSession.user?.email || 'Người dùng ẩn danh'}</h4>
                    <p>Phiên hỗ trợ #{selectedSession.id} - "{selectedSession.title}"</p>
                  </div>
                  <div className="console-pane-status">
                    {!selectedSession.assignedTo ? (
                      <button 
                        type="button" 
                        className="console-btn-claim"
                        onClick={() => handleClaimSession(selectedSession.id)}
                      >
                        Nhận hỗ trợ
                      </button>
                    ) : selectedSession.assignedTo.email === currentAdmin?.email ? (
                      <span className="console-status-text" style={{ color: '#059669', fontWeight: 600 }}>
                        ● Bạn đang hỗ trợ cuộc trò chuyện này
                      </span>
                    ) : (
                      <>
                        <span className="console-status-text" style={{ color: '#d97706' }}>
                          Nhân viên <strong>{selectedSession.assignedTo.email}</strong> đang hỗ trợ
                        </span>
                        <button 
                          type="button" 
                          className="console-btn-takeover"
                          onClick={() => handleTakeoverSession(selectedSession.id)}
                        >
                          Tiếp quản
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Pane messages */}
                <div className="console-messages-list">
                  {supportMessages.map((msg) => {
                    const isSystem = msg.role === 'support' && msg.content?.startsWith('[HỆ THỐNG]');
                    const isStaff = msg.role === 'support' || msg.role === 'admin';
                    return (
                      <div 
                        key={msg.id} 
                        className={`console-msg-bubble-wrapper ${isSystem ? 'console-msg-system' : isStaff ? 'console-msg-staff' : 'console-msg-user'}`}
                      >
                        <div className="console-msg-bubble">
                          <div className="console-msg-content">
                            {formatMessageContent(msg.content)}
                          </div>
                          {!isSystem && (
                            <span className="console-msg-time">{formatDateTime(msg.createdAt)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Footer Input */}
                {selectedSession.assignedTo?.email === currentAdmin?.email ? (
                  <form className="console-chat-input-form" onSubmit={handleSendSupportMessage}>
                    <input 
                      type="text" 
                      placeholder="Nhập tin nhắn gửi tới khách hàng..."
                      value={supportInputText}
                      onChange={(e) => setSupportInputText(e.target.value)}
                      disabled={isSendingSupport}
                    />
                    <button 
                      type="submit" 
                      className="console-chat-send-btn"
                      disabled={!supportInputText.trim() || isSendingSupport}
                    >
                      <Send size={18} />
                    </button>
                  </form>
                ) : (
                  <div className="console-read-only-banner">
                    Bạn đang ở chế độ Xem. {selectedSession.assignedTo ? `Nhân viên ${selectedSession.assignedTo.email} đang hỗ trợ.` : 'Vui lòng nhấn "Nhận hỗ trợ" để bắt đầu chat.'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* original AI logs view */
        <>
          {/* Search Bar */}
          <div className="logs-filter-wrapper">
            <form onSubmit={handleSearchSubmit} className="logs-search-form">
              <div className="search-input-group">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm theo Email người dùng hoặc tiêu đề cuộc trò chuyện..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchQuery && (
                  <button type="button" className="clear-search-btn" onClick={handleClearSearch}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <button type="submit" className="btn-logs-search">Tìm kiếm</button>
            </form>
          </div>

          {/* Table Content */}
          <div className="logs-table-wrapper">
            {isLoading ? (
              <div className="logs-loader-container">
                <div className="logs-spinner"></div>
                <p>Đang tải nhật ký hội thoại...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="logs-empty-state">
                <MessageSquare size={44} className="empty-icon" />
                <h3>Không tìm thấy lịch sử chat nào</h3>
                <p>Hiện tại chưa có cuộc hội thoại nào phù hợp với bộ lọc tìm kiếm của bạn.</p>
              </div>
            ) : (
              <>
                <table className="logs-data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Người dùng (User)</th>
                      <th>Tiêu đề cuộc trò chuyện</th>
                      <th>Thời gian cập nhật</th>
                      <th style={{ textAlign: 'center' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.id}>
                        <td>#{session.id}</td>
                        <td>
                          <div className="user-info-cell">
                            <User size={14} className="cell-icon" />
                            <span className="user-email" title={session.user?.email}>
                              {session.user?.email || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="session-title-cell" title={session.title}>
                          {session.title}
                        </td>
                        <td>
                          <div className="time-info-cell">
                            <Calendar size={14} className="cell-icon" />
                            <span>{formatDateTime(session.updatedAt)}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            type="button" 
                            className="btn-view-transcript"
                            onClick={() => handleViewTranscript(session)}
                            title="Xem nội dung hội thoại"
                          >
                            <Eye size={14} />
                            <span>Xem chi tiết</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="logs-pagination-footer">
                    <button
                      type="button"
                      className="page-nav-btn"
                      disabled={page === 0}
                      onClick={() => setPage(prev => Math.max(0, prev - 1))}
                    >
                      <ChevronLeft size={16} />
                      <span>Trang trước</span>
                    </button>
                    <span className="page-indicator">
                      Trang <strong>{page + 1}</strong> / {totalPages}
                    </span>
                    <button
                      type="button"
                      className="page-nav-btn"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                    >
                      <span>Trang sau</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Chat Transcript Modal */}
          {activeSession && (
            <div className="admin-chat-modal-overlay" onClick={handleCloseModal}>
              <div className="admin-chat-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="admin-chat-modal-header">
                  <div className="modal-header-info">
                    <Sparkles size={18} className="sparkle-icon" />
                    <div>
                      <h4>Chi tiết cuộc hội thoại #{activeSession.id}</h4>
                      <p>Người dùng: {activeSession.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <button type="button" className="modal-close-btn" onClick={handleCloseModal}>
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="admin-chat-modal-body">
                  {isLoadingMessages ? (
                    <div className="modal-loader-container">
                      <div className="logs-spinner"></div>
                      <p>Đang tải tin nhắn...</p>
                    </div>
                  ) : messageError ? (
                    <div className="modal-error-container">
                      <AlertCircle size={24} className="error-icon" />
                      <p>{messageError}</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="modal-empty-container">
                      <MessageSquare size={36} className="empty-icon" />
                      <p>Phiên chat này chưa có tin nhắn nào.</p>
                    </div>
                  ) : (
                    <div className="admin-chat-messages-list">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`admin-msg-bubble-wrapper ${msg.role === 'user' ? 'admin-msg-user' : 'admin-msg-ai'}`}
                        >
                          {msg.role !== 'user' && (
                            <div className="admin-ai-avatar">
                              <Bot size={14} />
                            </div>
                          )}
                          <div className="admin-msg-bubble">
                            <div className="admin-msg-content">
                              {formatMessageContent(msg.content)}
                            </div>
                            <span className="admin-msg-time">{formatDateTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="admin-chat-modal-footer">
                  <span className="session-subject-title">Tiêu đề: "{activeSession.title}"</span>
                  <button type="button" className="btn-close-footer" onClick={handleCloseModal}>
                    Đóng lại
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
