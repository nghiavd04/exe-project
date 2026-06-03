import React, { createContext, useContext, useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/AuthContext';
import { profileApi, programApi } from '../../../apis/customerApi';
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
      <div className="pd-page pd-locked-page">
        <div className="pd-locked-overlay">
          <div className="pd-locked-card">
            <span className="pd-lock-icon">🔐</span>
            <h2 className="pd-lock-title">Tính năng dành cho thành viên</h2>
            <p className="pd-lock-desc">
              Chương trình hỗ trợ 120 ngày có cấu trúc dựa trên bằng chứng khoa học — chỉ dành cho người đã kích hoạt gói dịch vụ.
            </p>
            <div className="pd-lock-features">
              {LOCK_FEATURES.map((f, i) => (
                <div key={i} className="pd-lock-feat">
                  <div className="pd-lock-feat-ico">{f.ico}</div>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
            <button className="pd-lock-cta" onClick={() => navigate('/goi-dich-vu')}>
              Xem các gói dịch vụ →
            </button>
            <button className="pd-lock-back-btn" onClick={() => navigate(-1)}>
              ← Quay lại trang trước
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pd-loading-container">
        <div className="pd-loading-spinner" />
        <div style={{ color: 'var(--teal-dark)', fontSize: '1.05rem', fontWeight: 600, fontFamily: 'Outfit', letterSpacing: '0.5px' }}>
          Đang tải thông tin lộ trình...
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
