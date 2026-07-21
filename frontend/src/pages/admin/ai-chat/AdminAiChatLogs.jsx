import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../../apis/adminApi';
import { useAuth } from '../../../hooks/AuthContext';
import { Client } from '@stomp/stompjs';
import {
  Search, Eye, MessageSquare, Calendar, User,
  X, ChevronLeft, ChevronRight, Bot, Sparkles, AlertCircle, Send, Plus
} from 'lucide-react';
import './AdminAiChatLogs.css';

export default function AdminAiChatLogs() {
  const { user: currentAdmin } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState('SUPPORT'); // 'AI' hoặc 'SUPPORT'
  const [globalUnreadCount, setGlobalUnreadCount] = useState(0);

  // User Search and Start Chat states
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [startingChatUserId, setStartingChatUserId] = useState(null);

  // Takeover confirmation states
  const [showTakeoverConfirm, setShowTakeoverConfirm] = useState(false);
  const [takeoverSessionId, setTakeoverSessionId] = useState(null);

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

  const fetchUnreadCount = async () => {
    try {
      const res = await adminApi.getAiChatUnreadCount();
      if (res.data.success) {
        setGlobalUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Lỗi khi tải số tin nhắn chưa đọc:', err);
    }
  };

  // Fetch sessions on dependencies change
  useEffect(() => {
    fetchSessions();
    fetchUnreadCount();
  }, [page, searchQuery, activeTab]);

  // Global WebSocket for session list updates (real-time badge)
  useEffect(() => {
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
    });

    client.onConnect = () => {
      client.subscribe('/topic/admin/chat/alerts', (message) => {
        const body = JSON.parse(message.body);
        if (body.eventType === 'NEW_MESSAGE' && body.sessionId) {
          setSessions(prev => {
            // Check if session exists in current list
            const exists = prev.some(s => s.id === body.sessionId);
            if (exists) {
              return prev.map(s => s.id === body.sessionId ? { ...s, unreadCount: (s.unreadCount || 0) + 1 } : s);
            } else {
              // If not exists, wait 1s and refetch to get it at top
              setTimeout(() => {
                fetchSessions();
                fetchUnreadCount();
              }, 1000);
              return prev;
            }
          });
          fetchUnreadCount();
        }
      });
    };

    client.activate();
    return () => client.deactivate();
  }, []);

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

  const handleOpenUserSearch = () => {
    setShowUserSearch(true);
    setUserSearchTerm('');
    setUserSearchResults([]);
  };

  const handleUserSearchChange = async (val) => {
    setUserSearchTerm(val);
    if (!val.trim()) {
      setUserSearchResults([]);
      return;
    }
    setIsSearchingUsers(true);
    try {
      const response = await adminApi.getUsers({
        search: val,
        role: 'CUSTOMER',
        size: 8
      });
      if (response.data.success) {
        setUserSearchResults(response.data.data.content || []);
      }
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const handleStartSupportSession = async (user) => {
    setStartingChatUserId(user.id);
    try {
      const res = await adminApi.startSupportSession(user.id);
      if (res.data.success) {
        const newSession = res.data.data;
        setSessions(prev => {
          const exists = prev.some(s => s.id === newSession.id);
          if (exists) {
            return prev.map(s => s.id === newSession.id ? newSession : s);
          }
          return [newSession, ...prev];
        });
        handleSelectSupportSession(newSession);
        setShowUserSearch(false);
      }
    } catch (err) {
      console.error('Lỗi khi tạo phiên hỗ trợ:', err);
      alert(err.response?.data?.message || 'Không thể bắt đầu chat với user này. Vui lòng kiểm tra gói thành viên của họ!');
    } finally {
      setStartingChatUserId(null);
    }
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
          setSessions(prev => prev.map(s => s.id === session.id ? { ...updatedSession, unreadCount: 0 } : s));
        }
      } else {
        // Cập nhật local session unread count = 0
        setSessions(prev => prev.map(s => s.id === session.id ? { ...s, unreadCount: 0 } : s));
      }

      // Đánh dấu đã đọc
      try {
        await adminApi.markSessionAsRead(session.id);
      } catch (e) {
        console.error('Không thể đánh dấu đã đọc:', e);
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

  const triggerTakeoverConfirm = (sessionId) => {
    setTakeoverSessionId(sessionId);
    setShowTakeoverConfirm(true);
  };

  const confirmTakeover = async () => {
    if (!takeoverSessionId) return;
    try {
      const res = await adminApi.takeoverSession(takeoverSessionId);
      if (res.data.success) {
        const updatedSession = res.data.data;
        setSelectedSession(updatedSession);
        setSessions(prev => prev.map(s => s.id === takeoverSessionId ? updatedSession : s));

        // Tải lại tin nhắn để hiển thị câu báo của hệ thống
        const msgRes = await adminApi.getAiChatMessages(takeoverSessionId);
        if (msgRes.data.success) {
          setSupportMessages(msgRes.data.data || []);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tiếp quản phòng chat:', err);
    } finally {
      setShowTakeoverConfirm(false);
      setTakeoverSessionId(null);
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
          <h1 className="admin-page-title">
            Quản lý Chat & Hỗ trợ
            {globalUnreadCount > 0 && (
              <span className="admin-header-unread-badge" style={{
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '14px',
                padding: '2px 8px',
                borderRadius: '12px',
                marginLeft: '10px',
                verticalAlign: 'middle'
              }}>
                {globalUnreadCount} chưa đọc
              </span>
            )}
          </h1>
          <p className="admin-page-subtitle">
            Cấu hình prompt, xem lịch sử trao đổi của AI hoặc tham gia chat trực tiếp để hỗ trợ người dùng trực tuyến.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-chat-tabs">
        <button
          type="button"
          className={`admin-chat-tab-btn ${activeTab === 'SUPPORT' ? 'active' : ''}`}
          onClick={() => handleTabChange('SUPPORT')}
        >
          <User size={18} />
          <span>Hỗ trợ Trực tuyến</span>
        </button>
        <button
          type="button"
          className={`admin-chat-tab-btn ${activeTab === 'AI' ? 'active' : ''}`}
          onClick={() => handleTabChange('AI')}
        >
          <Bot size={18} />
          <span>Lịch sử Chat AI</span>
        </button>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'SUPPORT' ? (
        /* live Support Console view */
        <div className="admin-support-console">
          {/* Left Sidebar */}
          <div className="console-sidebar">
            <div className="console-sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Danh sách yêu cầu ({sessions.length})</span>
              <button 
                type="button" 
                className="btn-console-new-chat" 
                onClick={handleOpenUserSearch}
                style={{
                  background: 'var(--teal)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--teal-dark)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--teal)'}
              >
                <Plus size={12} />
                <span>Tìm User</span>
              </button>
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
                      {s.unreadCount > 0 && (
                        <span className="console-unread-badge">{s.unreadCount}</span>
                      )}
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
                          onClick={() => triggerTakeoverConfirm(selectedSession.id)}
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

      {showUserSearch && (
        <div className="admin-chat-modal-overlay" onClick={() => setShowUserSearch(false)}>
          <div className="admin-chat-modal" style={{ maxWidth: '500px', height: 'auto', maxHeight: '550px' }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="admin-chat-modal-header" style={{ background: '#fff', color: '#1e293b', borderBottom: '1px solid #f1f5f9', padding: '16px 20px' }}>
              <div className="modal-header-info">
                <User size={18} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>Bắt đầu cuộc trò chuyện</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Tìm kiếm thành viên để chủ động hỗ trợ</p>
                </div>
              </div>
              <button type="button" className="modal-close-btn" style={{ color: '#64748b' }} onClick={() => setShowUserSearch(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="admin-chat-modal-body" style={{ padding: '20px', background: '#fff' }}>
              <div className="user-search-container" style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc email thành viên..."
                    value={userSearchTerm}
                    onChange={(e) => handleUserSearchChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: 'white',
                      color: 'var(--text)'
                    }}
                  />
                </div>

                {isSearchingUsers && (
                  <div style={{ marginTop: '15px', color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>
                    Đang tìm kiếm thành viên...
                  </div>
                )}

                {!isSearchingUsers && userSearchTerm.trim() && userSearchResults.length === 0 && (
                  <div style={{ marginTop: '15px', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>
                    Không tìm thấy thành viên nào phù hợp.
                  </div>
                )}

                {userSearchResults.length > 0 && (
                  <div style={{
                    marginTop: '15px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    maxHeight: '250px',
                    overflowY: 'auto'
                  }}>
                    {userSearchResults.map((u) => (
                      <div
                        key={u.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => handleStartSupportSession(u)}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>{u.fullName || 'Thành viên'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                        </div>
                        <button
                          type="button"
                          disabled={startingChatUserId === u.id}
                          style={{
                            background: 'var(--teal)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {startingChatUserId === u.id ? 'Đang tạo...' : 'Nhắn tin'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="admin-chat-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                className="btn-close-footer"
                onClick={() => setShowUserSearch(false)}
                style={{
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showTakeoverConfirm && (
        <div className="admin-chat-modal-overlay" onClick={() => {
          setShowTakeoverConfirm(false);
          setTakeoverSessionId(null);
        }}>
          <div className="admin-chat-modal" style={{ maxWidth: '450px', height: 'auto', maxHeight: '280px' }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="admin-chat-modal-header" style={{ background: '#fff', color: '#1e293b', borderBottom: '1px solid #f1f5f9', padding: '16px 20px' }}>
              <div className="modal-header-info">
                <AlertCircle size={20} style={{ color: '#d97706', flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>Xác nhận tiếp quản</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Chuyển đổi nhân viên hỗ trợ trực tiếp</p>
                </div>
              </div>
              <button type="button" className="modal-close-btn" style={{ color: '#64748b' }} onClick={() => {
                setShowTakeoverConfirm(false);
                setTakeoverSessionId(null);
              }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="admin-chat-modal-body" style={{ padding: '20px', background: '#fff', fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn tiếp quản cuộc trò chuyện này từ nhân viên khác không? 
              <br />
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '6px' }}>
                * Hành động này sẽ chuyển quyền phụ trách sang tài khoản của bạn và thông báo cho người dùng.
              </span>
            </div>

            {/* Modal Footer */}
            <div className="admin-chat-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => {
                  setShowTakeoverConfirm(false);
                  setTakeoverSessionId(null);
                }}
                style={{
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmTakeover}
                style={{
                  background: '#d97706',
                  border: 'none',
                  color: 'white',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
