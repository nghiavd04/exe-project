import React, { createContext, useContext, useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/AuthContext';
import { profileApi, programApi } from '../../../apis/customerApi';
import AppState from '../../../components/AppState';
import './ProgramDashboardPage.css';

const ProgramContext = createContext();

export const useProgram = () => useContext(ProgramContext);

const isTierAllowedForProgram = (tier) => {
  if (!tier || tier === 'FREE') return false;
  return true;
};

const LOCK_FEATURES = [
  { ico: '📅', text: 'Chương trình 120 ngày có cấu trúc chi tiết' },
  { ico: '✅', text: 'Nhiệm vụ hàng ngày & theo dõi tiến trình tự điều chỉnh' },
  { ico: '📊', text: 'Chỉ số tự theo dõi: thời gian màn hình, tâm trạng, giấc ngủ' },
  { ico: '📓', text: 'Nhật ký viết tự do nâng cao nhận thức' },
  { ico: '🔥', text: 'Số ngày liên tiếp & game hóa thúc đẩy động lực' },
  { ico: '🧬', text: 'Khoa học hành vi & tâm lý: CBT · ACT · Khoa học thần kinh' },
];

export default function ProgramLayout() {
  const navigate = useNavigate();
  const { user, userTier, updateUser } = useAuth();

  const isAllowed = isTierAllowedForProgram(userTier);
  const showLocked = !isAllowed;

  const [programMetadata, setProgramMetadata] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [dayDetail, setDayDetail] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [metrics, setMetrics] = useState({ screenTime: 80, mood: 7, sleep: 7, urge: 3, focus: 7, unconsciousOpenCount: 0, sleepHours: 7 });
  const [journal, setJournal] = useState('');
  const [savedToast, setSavedToast] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [toastTimeoutId, setToastTimeoutId] = useState(null);

  const showToastMessage = (message, type = 'info') => {
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    setToast({ show: true, message, type });
    const timer = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
    setToastTimeoutId(timer);
  };

  const loadDayDetail = async (dayNum) => {
    try {
      const dayRes = await programApi.getDayDetail(dayNum);
      if (dayRes.data && dayRes.data.success) {
        setDayDetail(dayRes.data.data);
        
        const apiTasks = dayRes.data.data.tasks.map(t => ({
          id: t.taskIndex,
          title: t.title,
          sub: '',
          badge: 'Hàng ngày',
          done: t.isCompleted
        }));
        setTasks(apiTasks);

        const logged = dayRes.data.data.loggedData;
        setMetrics({
          screenTime: logged?.screenTimeMinutes ?? 80,
          mood: logged?.moodScore ?? 7,
          sleep: logged?.sleepScore ?? 7,
          urge: logged?.urgeScore ?? 3,
          focus: logged?.focusScore ?? 7,
          unconsciousOpenCount: logged?.unconsciousOpenCount ?? 0,
          sleepHours: logged?.sleepHours ?? 7
        });
        setJournal(logged?.journalText ?? '');
      }
    } catch (err) {
      console.error("Error loading day detail:", err);
    }
  };

  const loadProgramData = async () => {
    setIsLoading(true);
    try {
      const metaRes = await programApi.getMetadata();
      if (metaRes.data && metaRes.data.success) {
        setProgramMetadata(metaRes.data.data);
      }

      try {
        const progressRes = await programApi.getProgress();
        if (progressRes.data && progressRes.data.success) {
          const progressData = progressRes.data.data;
          setUserProgress(progressData);
          setIsEnrolled(true);

          const dayNum = progressData.currentDay || 1;
          await loadDayDetail(dayNum);

          // Fetch analytics
          try {
            const analyticsRes = await programApi.getAnalytics();
            if (analyticsRes.data && analyticsRes.data.success) {
              setAnalytics(analyticsRes.data.data);
            }
          } catch (analyticsErr) {
            console.error("Error loading analytics:", analyticsErr);
          }
        }
      } catch (progressErr) {
        if (progressErr.response && progressErr.response.status === 400) {
          setIsEnrolled(false);
        } else {
          console.error("Error loading progress:", progressErr);
        }
      }
    } catch (err) {
      console.error("Error loading program data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const res = await profileApi.getProfile();
        if (res.data && res.data.success) {
          updateUser(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching latest profile:', err);
      }
    };
    if (user) {
      fetchLatestProfile();
    }
  }, []);

  useEffect(() => {
    if (isAllowed) {
      loadProgramData();
    }
  }, [isAllowed]);

  const handleEnroll = async () => {
    if (!isAllowed) return;
    try {
      const res = await programApi.enroll();
      if (res.data && res.data.success) {
        showToastMessage('Kích hoạt lộ trình thành công! Bắt đầu ngày 1 của bạn.', 'success');
        loadProgramData();
      }
    } catch (err) {
      console.error("Error enrolling:", err);
      showToastMessage('Có lỗi xảy ra khi bắt đầu lộ trình.', 'error');
    }
  };

  const handleResumeProgram = async () => {
    try {
      const res = await programApi.resume();
      if (res.data && res.data.success) {
        showToastMessage('Chào mừng bạn quay trở lại phác đồ!', 'success');
        await loadProgramData();
      }
    } catch (err) {
      console.error("Error resuming program:", err);
      const errMsg = err.response?.data?.message || 'Không thể tiếp tục lộ trình.';
      showToastMessage(errMsg, 'error');
    }
  };

  const handleRestartProgram = async () => {
    try {
      const res = await programApi.restart();
      if (res.data && res.data.success) {
        showToastMessage('Đã bắt đầu lại lộ trình từ ngày 1.', 'success');
        setShowRestartConfirm(false);
        await loadProgramData();
      }
    } catch (err) {
      console.error("Error restarting program:", err);
      const errMsg = err.response?.data?.message || 'Không thể bắt đầu lại lộ trình.';
      showToastMessage(errMsg, 'error');
    }
  };

  const handleToggleTask = async (taskIndex, isCompleted) => {
    if (!isEnrolled || !userProgress || !dayDetail) return;
    const dayNum = userProgress.currentDay;
    const weekNum = dayDetail.weekNumber;
    try {
      await programApi.toggleTask(dayNum, weekNum, taskIndex, isCompleted);
      setTasks(prev => prev.map(t => t.id === taskIndex ? { ...t, done: isCompleted } : t));
      showToastMessage('Cập nhật nhiệm vụ thành công', 'success');
    } catch (err) {
      console.error("Error toggling task:", err);
      showToastMessage('Không thể cập nhật nhiệm vụ.', 'error');
    }
  };

  const handleMetric = (key, val) => {
    setMetrics(prev => ({ ...prev, [key]: Number(val) }));
  };

  const handleSaveLogs = async () => {
    if (!isEnrolled || !userProgress) return;
    const dayNum = userProgress.currentDay;
    const payload = {
      screenTimeMinutes: metrics.screenTime,
      unconsciousOpenCount: metrics.unconsciousOpenCount ?? 0,
      urgeLevel: metrics.urge,
      sleepHours: metrics.sleepHours ?? metrics.sleep,
      moodScore: metrics.mood,
      sleepScore: metrics.sleep,
      urgeScore: metrics.urge,
      focusScore: metrics.focus,
      journalText: journal
    };
    try {
      await programApi.saveDailyLog(dayNum, payload);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
      showToastMessage('Ghi nhận chỉ số ngày thành công', 'success');
      loadProgramData();
      return true;
    } catch (err) {
      console.error("Error saving daily log:", err);
      const errMsg = err.response?.data?.message || 'Không thể lưu chỉ số ngày.';
      showToastMessage(errMsg, 'error');
      return false;
    }
  };

  const handleAdvanceDay = async () => {
    try {
      const res = await programApi.advanceDay();
      if (res.data && res.data.success) {
        showToastMessage('Chúc mừng! Bạn đã tiến sang ngày tiếp theo thành công.', 'success');
        await loadProgramData();
        return { success: true };
      }
      return { success: false, message: 'Không thể tiến sang ngày mới.' };
    } catch (err) {
      console.error("Error advancing day:", err);
      const errMsg = err.response?.data?.message || 'Không thể tiến sang ngày mới.';
      showToastMessage(errMsg, 'error');
      return { success: false, message: errMsg };
    }
  };

  // Early return for locked users (Inspect Element / F12 bypass protection)
  if (showLocked) {
    return (
      <div className="pd-page pd-state-page">
        <AppState
          variant="paywall"
          title="Chương trình 120 ngày dành cho thành viên"
          description="Mở khóa toàn bộ lộ trình, nhiệm vụ hằng ngày, nhật ký và các chỉ số theo dõi để bắt đầu hành trình tự cân bằng của bạn."
          actionLabel="Xem các gói dịch vụ"
          onAction={() => navigate('/goi-dich-vu')}
          secondaryLabel="Quay lại trang trước"
          secondaryAction={() => navigate(-1)}
        >
          <div className="pd-state-feature-list">
            {LOCK_FEATURES.map((f, i) => (
              <div key={i} className="pd-state-feature-item">
                <span>{f.ico}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </AppState>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pd-page pd-state-page">
        <AppState
          variant="loading"
          title="Đang tải thông tin lộ trình"
          description="Chúng tôi đang chuẩn bị dữ liệu tiến trình, nhiệm vụ và các chỉ số theo dõi của bạn."
        />
      </div>
    );
  }

  if (userProgress && userProgress.status === 'PAUSED') {
    return (
      <div className="pd-page pd-locked-page">
        <div className="pd-locked-overlay">
          {!showRestartConfirm ? (
            <div className="pd-locked-card" style={{ maxWidth: '540px' }}>
              <span className="pd-lock-icon" style={{ animation: 'none', transform: 'none' }}>⏸️</span>
              <h2 className="pd-lock-title">Lộ trình đang tạm dừng</h2>
              <p className="pd-lock-desc" style={{ marginBottom: '1.8rem' }}>
                Chào mừng bạn quay trở lại! Gói dịch vụ của bạn đã được kích hoạt lại. Bạn có một lộ trình phác đồ đang tạm dừng ở <strong>Ngày {userProgress.currentDay}</strong>. Hãy chọn cách tiếp tục:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', marginBottom: '1.2rem' }}>
                <button 
                  onClick={handleResumeProgram}
                  style={{
                    background: 'linear-gradient(135deg, var(--teal-dark) 0%, var(--teal) 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '1.1rem 1rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(13, 122, 110, 0.25)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>🔥 Tiếp tục lộ trình</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '400', opacity: 0.9 }}>
                    Tiếp tục từ Ngày {userProgress.currentDay} và bảo toàn chuỗi ngày streak
                  </span>
                </button>

                <button 
                  onClick={() => setShowRestartConfirm(true)}
                  style={{
                    background: '#fff',
                    color: 'var(--muted)',
                    border: '1.5px solid rgba(13, 122, 110, 0.2)',
                    padding: '1.1rem 1rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--teal-pale)';
                    e.currentTarget.style.borderColor = 'var(--teal)';
                    e.currentTarget.style.color = 'var(--teal)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = 'rgba(13, 122, 110, 0.2)';
                    e.currentTarget.style.color = 'var(--muted)';
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>🔄 Bắt đầu lại từ đầu</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '400', opacity: 0.9 }}>
                    Reset tiến trình về Ngày 1 và xóa tất cả nhật ký/nhiệm vụ cũ
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pd-locked-card" style={{ maxWidth: '480px' }}>
              <span className="pd-lock-icon">⚠️</span>
              <h2 className="pd-lock-title" style={{ color: '#e03131' }}>Xác nhận bắt đầu lại?</h2>
              <p className="pd-lock-desc">
                Hành động này sẽ <strong>xóa toàn bộ lịch sử</strong> nhiệm vụ và nhật ký ghi nhận của lộ trình trước đó. Bạn sẽ bắt đầu lại từ <strong>Ngày 1</strong> và không thể hoàn tác hành động này.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%' }}>
                <button
                  onClick={() => setShowRestartConfirm(false)}
                  style={{
                    flex: 1,
                    background: '#e9ecef',
                    color: '#495057',
                    border: 'none',
                    padding: '0.8rem',
                    borderRadius: 'var(--radius)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleRestartProgram}
                  style={{
                    flex: 1,
                    background: '#e03131',
                    color: '#fff',
                    border: 'none',
                    padding: '0.8rem',
                    borderRadius: 'var(--radius)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                >
                  Đồng ý Restart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <ProgramContext.Provider
      value={{
        programMetadata,
        userProgress,
        dayDetail,
        isEnrolled,
        isLoading,
        tasks,
        setTasks,
        metrics,
        setMetrics,
        journal,
        setJournal,
        savedToast,
        toast,
        showToastMessage,
        handleEnroll,
        handleToggleTask,
        handleMetric,
        handleSaveLogs,
        handleAdvanceDay,
        loadDayDetail,
        analytics,
      }}
    >
      <Outlet />
    </ProgramContext.Provider>
  );
}
