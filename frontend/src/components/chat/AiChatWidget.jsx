import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import { aiChatApi } from '../../apis/customerApi';
import { Client } from '@stomp/stompjs';
import {
  MessageSquare, Bot, Send, Plus, Trash2, X,
  ChevronLeft, Sparkles, AlertCircle, User
} from 'lucide-react';
import './AiChatWidget.css';

export default function AiChatWidget() {
  const { user, userWeight } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [chatType, setChatType] = useState('AI'); // 'AI' hoặc 'SUPPORT'

  useEffect(() => {
    if (userWeight === 1 && chatType !== 'SUPPORT') {
      setChatType('SUPPORT');
    }
  }, [userWeight]);
  const stompClientRef = useRef(null);
  const globalStompClientRef = useRef(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUnreadSupport, setHasUnreadSupport] = useState(false);

  // Thêm các state cho modal xóa và phân trang hội thoại từ backend
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetSessionId, setTargetSessionId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [chatError, setChatError] = useState(null);

  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await aiChatApi.getUnreadCount();
      if (res.data.success) {
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Lỗi khi lấy số tin nhắn chưa đọc:', err);
    }
  };

  useEffect(() => {
    if (user && userWeight >= 1) {
      fetchUnreadCount();
      
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

      const globalClient = new Client({
        brokerURL,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      globalClient.onConnect = () => {
        globalClient.subscribe(`/topic/user/chat/alerts/${user.id}`, (message) => {
          // Increment immediately
          setUnreadCount(prev => prev + 1);
          // Fetch exact after 1s
          setTimeout(() => {
            fetchUnreadCount();
          }, 1000);
        });
      };

      globalClient.activate();
      globalStompClientRef.current = globalClient;

      return () => {
        if (globalStompClientRef.current) {
          globalStompClientRef.current.deactivate();
        }
      };
    }
  }, [user]);

  useEffect(() => {
    if (unreadCount > 0) {
      setHasUnreadSupport(true);
    }
  }, [unreadCount]);

  useEffect(() => {
    if (isOpen && user && userWeight >= 1) {
      setChatError(null);
      // Đánh dấu đã đọc khi mở chat
      if (unreadCount > 0) {
        aiChatApi.markAllAsRead().then(() => setUnreadCount(0)).catch(console.error);
      }
      if (chatType === 'SUPPORT') {
        setHasUnreadSupport(false);
      }

      if (chatType === 'AI') {
        fetchSessions(0, false);
      } else {
        loadOrCreateSupportSession();
      }
    }
  }, [isOpen, chatType]);

  useEffect(() => {
    if (activeSessionId && chatType === 'SUPPORT') {
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
        client.subscribe(`/topic/chat/${activeSessionId}`, (message) => {
          const body = JSON.parse(message.body);
          if (body.eventType !== 'ASSIGNMENT_UPDATE') {
            setMessages(prev => {
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
  }, [activeSessionId, chatType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadOrCreateSupportSession = async () => {
    try {
      setIsLoading(true);
      setChatError(null);
      const res = await aiChatApi.getSessions(0, 1, 'SUPPORT');
      if (res.data.success && res.data.data.content && res.data.data.content.length > 0) {
        const supportSession = res.data.data.content[0];
        setActiveSessionId(supportSession.id);
        loadSupportMessages(supportSession.id);
      } else {
        const createRes = await aiChatApi.createSession('Hỗ trợ trực tuyến', 'SUPPORT');
        if (createRes.data.success) {
          const newSession = createRes.data.data;
          setActiveSessionId(newSession.id);
          loadSupportMessages(newSession.id);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải hoặc tạo phiên hỗ trợ:', err);
      setChatError('Không thể kết nối với kênh hỗ trợ. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSupportMessages = async (sessionId) => {
    try {
      setMessages([]);
      const res = await aiChatApi.getSessionMessages(sessionId, 30);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Không thể lấy lịch sử tin nhắn hỗ trợ:', err);
      setChatError('Không thể tải lịch sử cuộc trò chuyện.');
    }
  };

  const fetchSessions = async (page = 0, isLoadMore = false) => {
    try {
      setIsLoading(true);
      const res = await aiChatApi.getSessions(page, 5, chatType);
      if (res.data.success) {
        const pageData = res.data.data;
        if (isLoadMore) {
          setSessions(prev => [...prev, ...pageData.content]);
        } else {
          setSessions(pageData.content || []);
        }
        setCurrentPage(page);
        setHasMore(!pageData.last);
      }
    } catch (err) {
      console.error('Không thể lấy danh sách phiên trò chuyện:', err);
      setChatError('Không thể tải lịch sử trò chuyện. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      setChatError(null);
      const titleStr = chatType === 'SUPPORT' ? 'Hỗ trợ trực tuyến' : 'Cuộc hội thoại mới';
      const res = await aiChatApi.createSession(titleStr, chatType);
      if (res.data.success) {
        const newSession = res.data.data;
        setSessions(prev => [newSession, ...prev]);
        selectSession(newSession.id);
      }
    } catch (err) {
      console.error('Lỗi khi tạo cuộc trò chuyện mới:', err);
      const errorMsg = err.response?.data?.message || 'Không thể tạo cuộc trò chuyện mới. Vui lòng thử lại!';
      setChatError(errorMsg);
    }
  };

  const selectSession = async (sessionId) => {
    setActiveSessionId(sessionId);
    setChatError(null);
    try {
      setMessages([]);
      const res = await aiChatApi.getSessionMessages(sessionId, 30);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Không thể lấy lịch sử tin nhắn:', err);
      setMessages([
        {
          id: 'load-error',
          role: 'model',
          isSystemError: true,
          content: 'Không thể tải lịch sử tin nhắn của cuộc trò chuyện này. Vui lòng kiểm tra kết nối mạng và thử lại.',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');

    // Hiển thị tin nhắn của user ngay lập tức dưới dạng tin tạm
    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsSending(true);

    try {
      const res = await aiChatApi.sendMessage(activeSessionId, textToSend);
      if (res.data.success) {
        const returnedDto = res.data.data;
        if (chatType === 'SUPPORT') {
          // Đối với SUPPORT, REST trả về AiChatResponseDto nhưng chỉ chứa nội dung user vừa gửi
          const supportMsg = {
            id: returnedDto.messageId,
            role: 'user',
            content: returnedDto.aiText,
            createdAt: new Date().toISOString()
          };
          setMessages(prev => {
            const filtered = prev.filter(m => m.id !== tempUserMsg.id);
            if (filtered.some(m => m.id === supportMsg.id)) {
              return filtered;
            }
            return [...filtered, supportMsg];
          });
        } else {
          // Đối với AI, REST trả về AiChatResponseDto gồm aiText và suggestions
          const aiMsg = {
            id: returnedDto.messageId,
            role: 'model',
            content: returnedDto.aiText,
            suggestions: returnedDto.suggestions,
            createdAt: new Date().toISOString()
          };
          setMessages(prev => [...prev, aiMsg]);
          fetchSessions(0, false);
        }
      }
    } catch (err) {
      console.error('Lỗi khi gửi tin nhắn:', err);
      // Xóa tin nhắn tạm
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));

      const tempErrorMsg = {
        id: 'error-' + Date.now(),
        role: 'model',
        isSystemError: true,
        content: chatType === 'SUPPORT'
          ? 'Không thể gửi tin nhắn hỗ trợ. Vui lòng kiểm tra kết nối mạng!'
          : 'Xin lỗi, đã xảy ra lỗi kết nối với trợ lý AI. Vui lòng thử lại sau giây lát!',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempErrorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteSessionClick = (e, sessionId) => {
    e.stopPropagation();
    setTargetSessionId(sessionId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (!targetSessionId) return;
    try {
      setChatError(null);
      const res = await aiChatApi.deleteSession(targetSessionId);
      if (res.data.success) {
        setSessions(prev => prev.filter(s => s.id !== targetSessionId));
        if (activeSessionId === targetSessionId) {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Lỗi khi xóa cuộc trò chuyện:', err);
      setChatError('Không thể xóa cuộc trò chuyện. Vui lòng thử lại!');
    } finally {
      setDeleteModalOpen(false);
      setTargetSessionId(null);
    }
  };

  const getActiveSessionTitle = () => {
    const current = sessions.find(s => s.id === activeSessionId);
    return current ? current.title : 'Cuộc trò chuyện';
  };

  // Helper format markdown cơ bản cho text từ Gemini (newline, bold **, lists)
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
          <li key={lineIdx} className="chat-bullet-item">
            {formattedContent}
          </li>
        );
      }
      return (
        <p key={lineIdx} className="chat-paragraph">
          {formattedContent}
        </p>
      );
    });
  };

  // Chỉ hiển thị đối với người dùng đã đăng nhập và thuộc gói Basic (weight >= 1)
  if (!user || userWeight < 1) {
    return null;
  }

  return (
    <div className={`ai-chat-widget-wrapper ${isOpen ? 'widget-open' : ''}`}>
      {/* Nút tròn Chat nổi */}
      <button
        className="ai-chat-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Trợ lý ảo DOPA LESS"
      >
        {isOpen ? <X size={26} /> : <Bot size={26} />}
        {!isOpen && unreadCount > 0 && (
          <span className="chat-unread-badge">{unreadCount}</span>
        )}
        <span className="pulse-ring"></span>
      </button>

      {/* Giao diện Hộp thoại chat trượt lên */}
      <div className="ai-chat-drawer">
        {/* Header */}
        <div className="ai-chat-header">
          {activeSessionId !== null && (
            <button
              className="chat-back-btn"
              onClick={() => {
                if (chatType === 'SUPPORT') {
                  setChatType('AI');
                }
                setActiveSessionId(null);
                setMessages([]);
                setChatError(null);
              }}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="chat-header-title">
            {chatType === 'SUPPORT' ? <User size={16} style={{ color: '#fbbf24' }} /> : <Sparkles size={16} className="sparkle-icon" />}
            <span>{activeSessionId === null ? (chatType === 'SUPPORT' ? 'Hỗ trợ trực tuyến' : 'Trợ lý ảo DOPA LESS') : getActiveSessionTitle()}</span>
          </div>
          <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="ai-chat-body" ref={chatBodyRef}>
          {activeSessionId === null ? (
            /* Danh sách Session */
            <div className="session-list-view">
              {chatError && (
                <div className="chat-error-banner">
                  <AlertCircle size={14} className="error-banner-icon" />
                  <span>{chatError}</span>
                  <button type="button" className="error-banner-close" onClick={() => setChatError(null)}>
                    <X size={12} />
                  </button>
                </div>
              )}
              {userWeight >= 2 && (
                <div className="chat-type-toggle-container">
                  <button
                    type="button"
                    className={`chat-type-toggle-btn ${chatType === 'AI' ? 'active' : ''}`}
                    onClick={() => { setChatType('AI'); setChatError(null); }}
                  >
                    <Bot size={14} />
                    <span>Trợ lý AI</span>
                  </button>
                  <button
                    type="button"
                    className={`chat-type-toggle-btn ${chatType === 'SUPPORT' ? 'active' : ''}`}
                    onClick={() => { setChatType('SUPPORT'); setChatError(null); setHasUnreadSupport(false); }}
                  >
                    <User size={14} />
                    <span>Hỗ trợ trực tuyến</span>
                    {hasUnreadSupport && chatType !== 'SUPPORT' && (
                      <span className="chat-support-dot"></span>
                    )}
                  </button>
                </div>
              )}
              {chatType === 'AI' && (
                <button
                  className="new-session-btn"
                  onClick={handleCreateSession}
                >
                  <Plus size={18} />
                  <span>Bắt đầu cuộc trò chuyện mới</span>
                </button>
              )}

              <div className="sessions-scroll-container">
                {sessions.length > 0 && <div className="sessions-title">Hội thoại gần đây</div>}
                {isLoading && sessions.length === 0 ? (
                  <div className="chat-loader-container">
                    <div className="chat-spinner"></div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="sessions-empty-state">
                    <MessageSquare size={36} className="empty-icon" />
                    <p>Chưa có cuộc hội thoại nào.</p>
                    <p className="sub-text">Hãy nhấn nút bên trên để đặt câu hỏi cho Trợ lý ảo DOPA LESS.</p>
                  </div>
                ) : (
                  <>
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="session-list-item"
                        onClick={() => selectSession(session.id)}
                      >
                        <MessageSquare size={16} className="session-icon" />
                        <span className="session-item-title" title={session.title}>{session.title}</span>
                        <button
                          className="session-delete-btn"
                          onClick={(e) => handleDeleteSessionClick(e, session.id)}
                          title="Xóa cuộc trò chuyện"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}

                    {hasMore && (
                      <button
                        type="button"
                        className="load-more-sessions-btn"
                        disabled={isLoading}
                        onClick={() => fetchSessions(currentPage + 1, true)}
                      >
                        {isLoading ? 'Đang tải...' : 'Xem thêm hội thoại cũ'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Chi tiết cuộc trò chuyện */
            <div className="chat-messages-view">
              {messages.length === 0 ? (
                <div className="chat-welcome-state">
                  {chatType === 'SUPPORT' ? (
                    <>
                      <User size={44} className="welcome-avatar" style={{ color: '#0d7a6e' }} />
                      <h3>Gặp nhân viên hỗ trợ</h3>
                      <p>Gửi tin nhắn của bạn và đợi trong giây lát để tư vấn viên kết nối hỗ trợ bạn trực tuyến.</p>
                    </>
                  ) : (
                    <>
                      <Bot size={44} className="welcome-avatar" />
                      <h3>Tôi có thể giúp gì cho bạn?</h3>
                      <p>Hỏi tôi bất kỳ câu hỏi nào về sức khỏe, dinh dưỡng, lối sống hay phác đồ cá nhân hóa của bạn.</p>
                    </>
                  )}
                </div>

              ) : (
                <div className="messages-list">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-bubble-wrapper ${msg.role === 'user' ? 'msg-user' : 'msg-ai'} ${msg.isSystemError ? 'msg-error' : ''}`}
                    >
                      {msg.role !== 'user' && (
                        <div className="ai-avatar-circle">
                          {chatType === 'SUPPORT' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                      )}
                      <div className="message-bubble-content">
                        {formatMessageContent(msg.content)}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="suggestion-cards-container">
                            <div className="suggestion-cards-title">Gợi ý nội dung:</div>
                            <div className="suggestion-cards-scroll">
                              {msg.suggestions.map((item, idx) => (
                                <a
                                  key={idx}
                                  href={item.type === 'ARTICLE' ? `/bai-viet/${item.slug}` : `/trac-nghiem/${item.id}/bat-dau`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`suggestion-card suggestion-card-${item.type.toLowerCase()}`}
                                >
                                  <div className="suggestion-card-type">
                                    {item.type === 'ARTICLE' ? 'Bài viết' : 'Bài kiểm tra'}
                                  </div>
                                  <div className="suggestion-card-title">{item.title}</div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isSending && chatType === 'AI' && (
                    <div className="message-bubble-wrapper msg-ai">
                      <div className="ai-avatar-circle">
                        <Bot size={14} />
                      </div>
                      <div className="message-bubble-content typing-bubble">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer input (chỉ hiện khi đang trong phiên chat) */}
        {activeSessionId !== null && (
          <form className="ai-chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn tại đây..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
              maxLength={1000}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputText.trim() || isSending}
            >
              <Send size={18} />
            </button>
          </form>
        )}

        {/* Modal xác nhận xóa cuộc trò chuyện */}
        {deleteModalOpen && (
          <div className="chat-delete-modal-overlay">
            <div className="chat-delete-modal">
              <div className="chat-delete-modal-header">
                <AlertCircle size={22} className="delete-warning-icon" />
                <h4>Xóa cuộc trò chuyện?</h4>
              </div>
              <p className="chat-delete-modal-body">
                Lịch sử cuộc trò chuyện này sẽ bị xóa vĩnh viễn và không thể khôi phục lại.
              </p>
              <div className="chat-delete-modal-actions">
                <button
                  type="button"
                  className="chat-delete-modal-btn cancel-btn"
                  onClick={() => { setDeleteModalOpen(false); setTargetSessionId(null); }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="chat-delete-modal-btn confirm-btn"
                  onClick={confirmDeleteSession}
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
