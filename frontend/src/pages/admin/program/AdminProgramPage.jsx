import React, { useState, useEffect } from 'react';
import {
  Milestone, ChevronRight, ChevronDown, Edit2, Trash2, Plus, Save,
  CheckCircle2, XCircle, AlertCircle, Info, BookOpen, BarChart2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../apis/adminApi';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/ConfirmModal';
import { PageHeader } from '../../../components/PageSection';
import AppState from '../../../components/AppState';
import './AdminProgramPage.css';

export default function AdminProgramPage() {
  const [programData, setProgramData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhaseNum, setSelectedPhaseNum] = useState(1);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [expandedDays, setExpandedDays] = useState({});
  const [activeTreeItem, setActiveTreeItem] = useState(null);

  // Protocols state
  const [protocols, setProtocols] = useState([]);
  const [selectedProtocolId, setSelectedProtocolId] = useState('');

  // Phase metadata edits
  const [phaseFocus, setPhaseFocus] = useState('');
  const [phaseScience, setPhaseScience] = useState('');
  const [phaseSaving, setPhaseSaving] = useState(false);

  // Week description edits
  const [weekDescriptions, setWeekDescriptions] = useState({});

  // Phase Modal (Create)
  const [phaseModal, setPhaseModal] = useState({
    isOpen: false,
    phaseNumber: 1,
    label: '',
    rangeText: '',
    icon: '🧠',
    focus: '',
    science: ''
  });

  // Modals for CRUD
  const [taskModal, setTaskModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' or 'edit'
    id: null,
    phaseNumber: null,
    weekNumber: null,
    dayNumber: null,
    taskIndex: 0,
    title: '',
    subText: '',
    badge: ''
  });

  const [metricModal, setMetricModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' or 'edit'
    id: null,
    phaseNumber: null,
    weekNumber: null,
    dayNumber: null,
    metricName: ''
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  useEffect(() => {
    const loadProtocols = async () => {
      try {
        const res = await adminApi.getProtocols();
        if (res.data.success) {
          setProtocols(res.data.data);
          const defaultProto = res.data.data.find(p => p.code === 'P_INTENSIVE_120') || res.data.data[0];
          if (defaultProto) {
            setSelectedProtocolId(defaultProto.id);
          }
        }
      } catch (err) {
        toast.error('Không thể tải danh sách phác đồ');
      }
    };
    loadProtocols();
  }, []);

  useEffect(() => {
    if (selectedProtocolId) {
      fetchProgramData(selectedProtocolId);
    }
  }, [selectedProtocolId]);

  const fetchProgramData = async (protocolId, targetPhaseNum = null) => {
    if (!protocolId) return;
    try {
      setLoading(true);
      const res = await adminApi.getProgramMetadata(protocolId);
      if (res.data.success) {
        const data = res.data.data;
        setProgramData(data);

        // Choose which phase tab to open
        let activePhaseNum = targetPhaseNum !== null ? targetPhaseNum : selectedPhaseNum;

        // If the selected phase no longer exists (e.g. was deleted), default to the first available phase
        if (data.phases && data.phases.length > 0) {
          const exists = data.phases.some(p => p.num === activePhaseNum);
          if (!exists) {
            activePhaseNum = data.phases[0].num;
          }
        } else {
          activePhaseNum = null;
        }

        setSelectedPhaseNum(activePhaseNum);

        if (activePhaseNum !== null) {
          const currentPhase = data.phases.find(p => p.num === activePhaseNum);
          if (currentPhase) {
            setPhaseFocus(currentPhase.focus || '');
            setPhaseScience(currentPhase.science || '');

            // Auto-expand the first week and select first day
            if (currentPhase.weeks && currentPhase.weeks.length > 0) {
              const firstWeek = currentPhase.weeks[0];
              setExpandedWeeks({ [firstWeek.num]: true });
              if (firstWeek.days && firstWeek.days.length > 0) {
                const firstDay = firstWeek.days[0];
                setActiveTreeItem({ type: 'day', num: firstDay.num, weekNum: firstWeek.num, phaseNum: activePhaseNum });
              } else {
                setActiveTreeItem({ type: 'week', num: firstWeek.num, phaseNum: activePhaseNum });
              }
            } else {
              setActiveTreeItem({ type: 'phase', num: activePhaseNum });
            }
          }
        } else {
          setActiveTreeItem(null);
        }

        // Initialize week descriptions state
        const descriptions = {};
        data.phases.forEach(p => {
          p.weeks.forEach(w => {
            descriptions[w.num] = w.description || '';
          });
        });
        setWeekDescriptions(descriptions);
      }
    } catch (err) {
      toast.error('Không thể tải cấu trúc phác đồ');
    } finally {
      setLoading(false);
    }
  };

  // Update selected phase and its metadata form values
  const handlePhaseChange = (phaseNum) => {
    setSelectedPhaseNum(phaseNum);
    if (programData) {
      const targetPhase = programData.phases.find(p => p.num === phaseNum);
      if (targetPhase) {
        setPhaseFocus(targetPhase.focus || '');
        setPhaseScience(targetPhase.science || '');

        // Auto-expand the first week of the new phase
        if (targetPhase.weeks && targetPhase.weeks.length > 0) {
          const firstWeek = targetPhase.weeks[0];
          setExpandedWeeks({ [firstWeek.num]: true });

          // If first week has days, select the first day automatically
          if (firstWeek.days && firstWeek.days.length > 0) {
            const firstDay = firstWeek.days[0];
            setActiveTreeItem({ type: 'day', num: firstDay.num, weekNum: firstWeek.num, phaseNum });
          } else {
            // Otherwise select the week itself
            setActiveTreeItem({ type: 'week', num: firstWeek.num, phaseNum });
          }
        } else {
          setExpandedWeeks({});
          setActiveTreeItem({ type: 'phase', num: phaseNum });
        }
      }
    }
  };


  // Toggle week accordion
  const toggleWeek = (weekNum) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  // Toggle day accordion
  const toggleDay = (dayNum) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNum]: !prev[dayNum]
    }));
  };

  // Create Phase Trigger
  const openCreatePhaseModal = () => {
    let nextPhaseNum = 1;
    if (programData && programData.phases && programData.phases.length > 0) {
      const maxPhase = Math.max(...programData.phases.map(p => p.num));
      nextPhaseNum = maxPhase + 1;
    }

    setPhaseModal({
      isOpen: true,
      phaseNumber: nextPhaseNum,
      label: `Giai đoạn ${nextPhaseNum}`,
      rangeText: `Ngày ${(nextPhaseNum - 1) * 30 + 1}–${nextPhaseNum * 30}`,
      icon: '🧠',
      focus: '',
      science: ''
    });
  };

  const submitPhaseModal = async (e) => {
    e.preventDefault();
    if (!phaseModal.label.trim() || !phaseModal.rangeText.trim() || !phaseModal.focus.trim() || !phaseModal.science.trim()) {
      toast.error('Vui lòng nhập đầy đủ tất cả các trường dữ liệu');
      return;
    }

    try {
      const res = await adminApi.createProgramPhase(selectedProtocolId, {
        phaseNumber: phaseModal.phaseNumber,
        label: phaseModal.label,
        rangeText: phaseModal.rangeText,
        icon: phaseModal.icon,
        focus: phaseModal.focus,
        science: phaseModal.science
      });

      if (res.data.success) {
        toast.success(`Đã thêm Giai đoạn ${phaseModal.phaseNumber} thành công!`);
        setPhaseModal(prev => ({ ...prev, isOpen: false }));
        // Refresh and select the newly created phase
        fetchProgramData(selectedProtocolId, phaseModal.phaseNumber);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi tạo giai đoạn';
      toast.error(msg);
    }
  };

  // Delete Phase Trigger
  const handleDeletePhase = () => {
    if (!selectedPhaseNum) return;

    setConfirmModal({
      isOpen: true,
      title: `Xác nhận xóa Giai đoạn ${selectedPhaseNum}`,
      message: `CẢNH BÁO CỰC KỲ QUAN TRỌNG: Bạn có chắc chắn muốn xóa Giai đoạn ${selectedPhaseNum}? Hành động này sẽ tự động xóa sạch tất cả các Tuần, Ngày, Nhiệm vụ và Chỉ số nằm trong giai đoạn này. Dữ liệu lịch sử nhật ký của người dùng cũ sẽ ĐƯỢC BẢO TOÀN, không bị xóa theo.`,
      onConfirm: async () => {
        try {
          const res = await adminApi.deleteProgramPhase(selectedProtocolId, selectedPhaseNum);
          if (res.data.success) {
            toast.success(`Đã xóa Giai đoạn ${selectedPhaseNum} thành công`);
            fetchProgramData(selectedProtocolId);
          }
        } catch (err) {
          toast.error('Lỗi khi xóa giai đoạn');
        }
      }
    });
  };

  // Save Phase Metadata Focus & Science
  const handleSavePhase = async () => {
    if (!phaseFocus.trim() || !phaseScience.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin mục tiêu và cơ sở khoa học');
      return;
    }
    try {
      setPhaseSaving(true);
      const res = await adminApi.updateProgramPhase(selectedProtocolId, selectedPhaseNum, {
        focus: phaseFocus,
        science: phaseScience
      });
      if (res.data.success) {
        toast.success('Cập nhật thông tin giai đoạn thành công');
        // Refresh local memory data
        setProgramData(prev => {
          const updatedPhases = prev.phases.map(p => {
            if (p.num === selectedPhaseNum) {
              return { ...p, focus: phaseFocus, science: phaseScience };
            }
            return p;
          });
          return { ...prev, phases: updatedPhases };
        });
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật giai đoạn');
    } finally {
      setPhaseSaving(false);
    }
  };

  // Save Week Description
  const handleSaveWeekDesc = async (weekNum) => {
    const desc = weekDescriptions[weekNum] || '';
    try {
      const res = await adminApi.updateProgramWeek(selectedProtocolId, weekNum, { description: desc });
      if (res.data.success) {
        toast.success(`Cập nhật mô tả Tuần ${weekNum} thành công`);
        // Refresh local memory data
        setProgramData(prev => {
          const updatedPhases = prev.phases.map(p => {
            const updatedWeeks = p.weeks.map(w => {
              if (w.num === weekNum) {
                return { ...w, description: desc };
              }
              return w;
            });
            return { ...p, weeks: updatedWeeks };
          });
          return { ...prev, phases: updatedPhases };
        });
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật mô tả tuần');
    }
  };

  // Task CRUD triggers
  const openCreateTask = (phaseNum, weekNum, dayNum, currentTasksCount) => {
    setTaskModal({
      isOpen: true,
      mode: 'create',
      id: null,
      phaseNumber: phaseNum,
      weekNumber: weekNum,
      dayNumber: dayNum,
      taskIndex: currentTasksCount,
      title: '',
      subText: '',
      badge: 'BẮT BUỘC'
    });
  };

  const openEditTask = (task, phaseNum, weekNum, dayNum) => {
    setTaskModal({
      isOpen: true,
      mode: 'edit',
      id: task.id,
      phaseNumber: phaseNum,
      weekNumber: weekNum,
      dayNumber: dayNum,
      taskIndex: task.taskIndex,
      title: task.title,
      subText: task.subText || '',
      badge: task.badge || 'BẮT BUỘC'
    });
  };

  const submitTaskModal = async (e) => {
    e.preventDefault();
    if (!taskModal.title.trim()) {
      toast.error('Tiêu đề nhiệm vụ không được bỏ trống');
      return;
    }

    try {
      const data = {
        phaseNumber: taskModal.phaseNumber,
        weekNumber: taskModal.weekNumber,
        dayNumber: taskModal.dayNumber,
        taskIndex: taskModal.taskIndex,
        title: taskModal.title,
        subText: taskModal.subText || null,
        badge: taskModal.badge || null
      };

      let res;
      if (taskModal.mode === 'create') {
        res = await adminApi.createProgramTask(selectedProtocolId, data);
        if (res.data.success) {
          toast.success('Thêm nhiệm vụ thành công');
        }
      } else {
        res = await adminApi.updateProgramTask(selectedProtocolId, taskModal.id, data);
        if (res.data.success) {
          toast.success('Cập nhật nhiệm vụ thành công');
        }
      }

      setTaskModal(prev => ({ ...prev, isOpen: false }));
      fetchProgramData(selectedProtocolId);
    } catch (err) {
      toast.error('Lỗi khi lưu nhiệm vụ');
    }
  };

  const handleDeleteTask = (taskId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa nhiệm vụ',
      message: 'Bạn có chắc chắn muốn xóa nhiệm vụ này khỏi phác đồ? Dữ liệu lưu vết của người dùng cũ sẽ không bị ảnh hưởng.',
      onConfirm: async () => {
        try {
          const res = await adminApi.deleteProgramTask(selectedProtocolId, taskId);
          if (res.data.success) {
            toast.success('Đã xóa nhiệm vụ');
            fetchProgramData(selectedProtocolId);
          }
        } catch (err) {
          toast.error('Lỗi khi xóa nhiệm vụ');
        }
      }
    });
  };

  // Metric CRUD triggers
  const openCreateMetric = (phaseNum, weekNum, dayNum) => {
    setMetricModal({
      isOpen: true,
      mode: 'create',
      id: null,
      phaseNumber: phaseNum,
      weekNumber: weekNum,
      dayNumber: dayNum,
      metricName: ''
    });
  };

  const openEditMetric = (metric, phaseNum, weekNum, dayNum) => {
    setMetricModal({
      isOpen: true,
      mode: 'edit',
      id: metric.id,
      phaseNumber: phaseNum,
      weekNumber: weekNum,
      dayNumber: dayNum,
      metricName: metric.metricName
    });
  };

  const submitMetricModal = async (e) => {
    e.preventDefault();
    if (!metricModal.metricName.trim()) {
      toast.error('Tên chỉ số không được bỏ trống');
      return;
    }

    try {
      const data = {
        phaseNumber: metricModal.phaseNumber,
        weekNumber: metricModal.weekNumber,
        dayNumber: metricModal.dayNumber,
        metricName: metricModal.metricName
      };

      let res;
      if (metricModal.mode === 'create') {
        res = await adminApi.createProgramMetric(selectedProtocolId, data);
        if (res.data.success) {
          toast.success('Thêm chỉ số thành công');
        }
      } else {
        res = await adminApi.updateProgramMetric(selectedProtocolId, metricModal.id, data);
        if (res.data.success) {
          toast.success('Cập nhật chỉ số thành công');
        }
      }

      setMetricModal(prev => ({ ...prev, isOpen: false }));
      fetchProgramData(selectedProtocolId);
    } catch (err) {
      toast.error('Lỗi khi lưu chỉ số');
    }
  };

  const handleDeleteMetric = (metricId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa chỉ số đo lường',
      message: 'Bạn có chắc chắn muốn xóa chỉ số này khỏi phác đồ?',
      onConfirm: async () => {
        try {
          const res = await adminApi.deleteProgramMetric(selectedProtocolId, metricId);
          if (res.data.success) {
            toast.success('Đã xóa chỉ số thành công');
            fetchProgramData(selectedProtocolId);
          }
        } catch (err) {
          toast.error('Lỗi khi xóa chỉ số');
        }
      }
    });
  };

  const getBadgeStyle = (badge) => {
    const b = (badge || '').toUpperCase();
    if (b.includes('BẮT BUỘC')) return { backgroundColor: '#fee2e2', color: '#dc2626' };
    if (b.includes('KHUYÊN') || b.includes('NÊN')) return { backgroundColor: '#e0f2fe', color: '#0284c7' };
    if (b.includes('THỂ CHẤT')) return { backgroundColor: '#ffedd5', color: '#ea580c' };
    if (b.includes('TINH THẦN') || b.includes('THIỀN')) return { backgroundColor: '#f3e8ff', color: '#9333ea' };
    return { backgroundColor: '#f1f5f9', color: '#475569' };
  };

  if (loading && !programData) {
    return (
      <AppState
        variant="loading"
        title="Đang tải cấu trúc phác đồ"
        description="Chúng tôi đang lấy thông tin các giai đoạn, tuần và ngày kiểm tra mới nhất."
      />
    );
  }

  const selectedPhase = programData && programData.phases ? programData.phases.find(p => p.num === selectedPhaseNum) : null;

  const renderTreeNavigator = () => {
    if (!programData || !selectedPhase) return null;
    return (
      <div className="program-tree-nav">
        {/* Phase Node */}
        <div
          className={`tree-item tree-phase-item ${activeTreeItem?.type === 'phase' ? 'active' : ''}`}
          onClick={() => {
            setActiveTreeItem({ type: 'phase', num: selectedPhaseNum });
            setPhaseFocus(selectedPhase.focus || '');
            setPhaseScience(selectedPhase.science || '');
          }}
        >
          <span className="tree-item-icon">{selectedPhase.icon || '🧠'}</span>
          <span className="tree-item-label font-bold">Giai đoạn {selectedPhase.num}: {selectedPhase.label}</span>
        </div>

        {/* Weeks & Days Tree */}
        <div className="tree-weeks-container" style={{ marginTop: '0.75rem' }}>
          <div className="tree-title" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.25rem 0.5rem', marginBottom: '0.5rem' }}>
            Tuần & Ngày
          </div>
          {selectedPhase.weeks && selectedPhase.weeks.map(week => {
            const isWeekExpanded = !!expandedWeeks[week.num];
            const isWeekActive = activeTreeItem?.type === 'week' && activeTreeItem?.num === week.num;
            return (
              <div key={week.num} className="tree-week-node">
                <div
                  className={`tree-item tree-week-item ${isWeekActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTreeItem({ type: 'week', num: week.num, phaseNum: selectedPhaseNum });
                    toggleWeek(week.num);
                  }}
                >
                  <span className="tree-chevron" onClick={(e) => { e.stopPropagation(); toggleWeek(week.num); }}>
                    {isWeekExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  <span className="tree-item-label">Tuần {week.num}: {week.label}</span>
                </div>

                {isWeekExpanded && (
                  <div className="tree-days-list animate-fade-in">
                    {week.days && week.days.length > 0 ? (
                      week.days.map(day => {
                        const isDayActive = activeTreeItem?.type === 'day' && activeTreeItem?.num === day.num;
                        return (
                          <div
                            key={day.num}
                            className={`tree-item tree-day-item ${isDayActive ? 'active' : ''}`}
                            onClick={() => {
                              setActiveTreeItem({ type: 'day', num: day.num, weekNum: week.num, phaseNum: selectedPhaseNum });
                            }}
                          >
                            <span className="tree-day-dot"></span>
                            <span className="tree-item-label">Ngày {day.num}: {day.label}</span>
                          </div>
                        );
                      })
                    ) : (
                      <span className="tree-empty-hint">Không có ngày (Xem tuần)</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEditorPanel = () => {
    if (!activeTreeItem || !selectedPhase) {
      return (
        <div className="editor-placeholder-card">
          <Info size={32} color="var(--muted)" />
          <p>Vui lòng chọn một mục từ cây thư mục bên trái để bắt đầu cấu hình.</p>
        </div>
      );
    }

    if (activeTreeItem.type === 'phase') {
      return (
        <div className="phase-metadata-card animate-fade-in">
          <h3 className="section-title">
            <Info size={18} /> Cấu hình thông tin Giai đoạn {selectedPhase.num}: {selectedPhase.label}
          </h3>

          <div className="form-group-row" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-field" style={{ width: '100%' }}>
              <label className="field-label">Mục tiêu Giai đoạn (Focus)</label>
              <textarea
                className="field-textarea"
                value={phaseFocus}
                onChange={(e) => setPhaseFocus(e.target.value)}
                placeholder="Nhập mục tiêu hành vi chính của giai đoạn này..."
                rows={3}
              />
            </div>
            <div className="form-field" style={{ width: '100%' }}>
              <label className="field-label">Cơ sở Khoa học (Science)</label>
              <textarea
                className="field-textarea"
                value={phaseScience}
                onChange={(e) => setPhaseScience(e.target.value)}
                placeholder="Nhập các cơ sở nghiên cứu khoa học hỗ trợ..."
                rows={3}
              />
            </div>
          </div>

          <div className="btn-align-right" style={{ gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              onClick={handleDeletePhase}
              className="btn-save-meta"
              style={{ backgroundColor: '#ef4444', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)' }}
            >
              <Trash2 size={16} /> Xóa giai đoạn này
            </button>
            <button
              onClick={handleSavePhase}
              disabled={phaseSaving}
              className="btn-save-meta"
            >
              <Save size={16} /> {phaseSaving ? 'Đang lưu...' : 'Lưu thông tin giai đoạn'}
            </button>
          </div>
        </div>
      );
    }

    if (activeTreeItem.type === 'week') {
      const week = selectedPhase.weeks.find(w => w.num === activeTreeItem.num);
      if (!week) return <p className="no-data-placeholder">Không tìm thấy thông tin tuần.</p>;

      const hasDays = week.days && week.days.length > 0;

      return (
        <div className="week-editor-card animate-fade-in">
          <div className="editor-card-header" style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, color: 'var(--teal-dark)' }}>Tuần {week.num}: {week.label} <span className="week-range-text">({week.range})</span></h3>
          </div>

          {/* Week Description Editor */}
          <div className="week-desc-edit-box">
            <label className="field-label-small">Mô tả định hướng của tuần:</label>
            <div className="input-with-button-flex">
              <input
                type="text"
                className="week-desc-input"
                value={weekDescriptions[week.num] || ''}
                onChange={(e) => setWeekDescriptions({
                  ...weekDescriptions,
                  [week.num]: e.target.value
                })}
                placeholder="Nhập hướng dẫn mục tiêu cho tuần này..."
              />
              <button
                onClick={() => handleSaveWeekDesc(week.num)}
                className="btn-save-week-desc"
                title="Lưu mô tả tuần"
              >
                <Save size={16} /> Lưu
              </button>
            </div>
          </div>

          {hasDays && (
            <div className="week-navigation-helper" style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--teal-dark)', fontSize: '0.95rem', fontWeight: 700 }}>Danh sách ngày điều trị:</h4>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>Tuần này được phân chia thành {week.days.length} ngày trị liệu. Vui lòng bấm vào từng ngày ở cây điều hướng bên trái hoặc dùng các nút nhanh bên dưới để cấu hình chi tiết Nhiệm vụ & Chỉ số.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.6rem' }}>
                {week.days.map(day => (
                  <button
                    key={day.num}
                    onClick={() => setActiveTreeItem({ type: 'day', num: day.num, weekNum: week.num, phaseNum: selectedPhaseNum })}
                    className="day-quick-nav-btn"
                  >
                    Ngày {day.num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Tasks & Metrics (Always display to support editing weekly metadata) */}
          <div className="crud-two-columns-layout no-border mt-3">
            {/* Tasks Column */}
            <div className="crud-column">
              <div className="column-header-row">
                <h4><BookOpen size={16} /> Nhiệm vụ trong tuần</h4>
                <button
                  onClick={() => openCreateTask(selectedPhase.num, week.num, null, week.tasks.length)}
                  className="btn-add-meta-item"
                >
                  <Plus size={14} /> Thêm nhiệm vụ
                </button>
              </div>
              <div className="meta-items-list">
                {week.tasks.length === 0 ? (
                  <p className="no-data-placeholder">Chưa có nhiệm vụ nào.</p>
                ) : week.tasks.map((task) => (
                  <div key={task.id} className="meta-item-card">
                    <div className="meta-item-details">
                      <div className="meta-item-index-badge">#{task.taskIndex + 1}</div>
                      <div className="meta-item-text-group">
                        <div className="meta-item-title-flex">
                          <span className="meta-item-title">{task.title}</span>
                          {task.badge && (
                            <span className="meta-badge" style={getBadgeStyle(task.badge)}>
                              {task.badge}
                            </span>
                          )}
                        </div>
                        {task.subText && <p className="meta-item-subtext">{task.subText}</p>}
                      </div>
                    </div>
                    <div className="meta-item-actions">
                      <button
                        onClick={() => openEditTask(task, selectedPhase.num, week.num, null)}
                        className="btn-icon-edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="btn-icon-delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics Column */}
            <div className="crud-column">
              <div className="column-header-row">
                <h4><BarChart2 size={16} /> Chỉ số đo lường tuần</h4>
                <button
                  onClick={() => openCreateMetric(selectedPhase.num, week.num, null)}
                  className="btn-add-meta-item"
                >
                  <Plus size={14} /> Thêm chỉ số
                </button>
              </div>
              <div className="meta-items-list">
                {week.metrics.length === 0 ? (
                  <p className="no-data-placeholder">Chưa có chỉ số theo dõi.</p>
                ) : week.metrics.map((metric) => (
                  <div key={metric.id} className="meta-item-card font-small">
                    <span className="metric-name-text">✓ {metric.metricName}</span>
                    <div className="meta-item-actions">
                      <button
                        onClick={() => openEditMetric(metric, selectedPhase.num, week.num, null)}
                        className="btn-icon-edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteMetric(metric.id)}
                        className="btn-icon-delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTreeItem.type === 'day') {
      const week = selectedPhase.weeks.find(w => w.num === activeTreeItem.weekNum);
      const day = week?.days?.find(d => d.num === activeTreeItem.num);
      if (!day) return <p className="no-data-placeholder">Không tìm thấy thông tin ngày.</p>;

      return (
        <div className="day-editor-card animate-fade-in">
          <div className="editor-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, color: 'var(--teal-dark)' }}>Ngày {day.num}: {day.label}</h3>
            <button
              onClick={() => setActiveTreeItem({ type: 'week', num: week.num, phaseNum: selectedPhaseNum })}
              className="ui-btn ui-btn--ghost"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
            >
              Xem Tuần {week.num}
            </button>
          </div>

          <div className="crud-two-columns-layout no-border">
            {/* Tasks Column */}
            <div className="crud-column">
              <div className="column-header-row">
                <h4><BookOpen size={16} /> Nhiệm vụ trong ngày</h4>
                <button
                  onClick={() => openCreateTask(selectedPhase.num, week.num, day.num, day.tasks.length)}
                  className="btn-add-meta-item"
                >
                  <Plus size={14} /> Thêm nhiệm vụ
                </button>
              </div>
              <div className="meta-items-list">
                {day.tasks.length === 0 ? (
                  <p className="no-data-placeholder">Chưa có nhiệm vụ nào.</p>
                ) : day.tasks.map((task) => (
                  <div key={task.id} className="meta-item-card">
                    <div className="meta-item-details">
                      <div className="meta-item-index-badge">#{task.taskIndex + 1}</div>
                      <div className="meta-item-text-group">
                        <div className="meta-item-title-flex">
                          <span className="meta-item-title">{task.title}</span>
                          {task.badge && (
                            <span className="meta-badge" style={getBadgeStyle(task.badge)}>
                              {task.badge}
                            </span>
                          )}
                        </div>
                        {task.subText && <p className="meta-item-subtext">{task.subText}</p>}
                      </div>
                    </div>
                    <div className="meta-item-actions">
                      <button
                        onClick={() => openEditTask(task, selectedPhase.num, week.num, day.num)}
                        className="btn-icon-edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="btn-icon-delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics Column */}
            <div className="crud-column">
              <div className="column-header-row">
                <h4><BarChart2 size={16} /> Chỉ số đo lường</h4>
                <button
                  onClick={() => openCreateMetric(selectedPhase.num, week.num, day.num)}
                  className="btn-add-meta-item"
                >
                  <Plus size={14} /> Thêm chỉ số
                </button>
              </div>
              <div className="meta-items-list">
                {day.metrics.length === 0 ? (
                  <p className="no-data-placeholder">Chưa có chỉ số theo dõi.</p>
                ) : day.metrics.map((metric) => (
                  <div key={metric.id} className="meta-item-card font-small">
                    <span className="metric-name-text">✓ {metric.metricName}</span>
                    <div className="meta-item-actions">
                      <button
                        onClick={() => openEditMetric(metric, selectedPhase.num, week.num, day.num)}
                        className="btn-icon-edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteMetric(metric.id)}
                        className="btn-icon-delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="admin-page">
      <PageHeader
        className="subscription-header"
        title="Lộ trình & Phác đồ điều trị"
        description="Thiết lập chi tiết cấu trúc giai đoạn, tuần, ngày, nhiệm vụ daily và các chỉ số đo lường."
        breadcrumbs={[
          { label: 'Tổng quan', to: '/admin' },
          { label: 'Quản lý phác đồ' }
        ]}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontWeight: '600', color: 'var(--muted)', fontSize: '0.95rem' }}>Chọn phác đồ:</label>
            <select
              value={selectedProtocolId}
              onChange={(e) => setSelectedProtocolId(e.target.value)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius)',
                border: '1.5px solid rgba(13, 122, 110, 0.2)',
                fontSize: '0.95rem',
                fontWeight: '700',
                color: 'var(--teal-dark)',
                background: '#fff',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {protocols.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.durationDays} ngày)
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Phase Tabs */}
      <div className="subscription-tabs" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        {programData && programData.phases && programData.phases.map(p => (
          <button
            key={p.num}
            onClick={() => handlePhaseChange(p.num)}
            className={`subscription-tab-btn ${selectedPhaseNum === p.num ? 'active' : ''}`}
          >
            {p.icon} Giai đoạn {p.num} ({p.range})
          </button>
        ))}
        <button
          onClick={openCreatePhaseModal}
          className="subscription-tab-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--teal-dark)', fontWeight: 'bold' }}
        >
          <Plus size={18} /> Thêm giai đoạn
        </button>
      </div>

      {selectedPhase ? (
        <div className="program-split-layout">
          {/* Left Navigation Tree */}
          <aside className="program-layout-sidebar">
            {renderTreeNavigator()}
          </aside>

          {/* Right Editor Panel */}
          <main className="program-layout-editor">
            {renderEditorPanel()}
          </main>
        </div>
      ) : (
        <div className="no-data-placeholder" style={{ padding: '5rem', background: 'white', borderRadius: '16px', marginTop: '1.5rem', border: '1px solid #edf2f7' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--muted)', opacity: 0.5 }} />
          <p>Chưa có giai đoạn nào trong phác đồ. Bấm "+ Thêm giai đoạn" để bắt đầu thiết kế.</p>
        </div>
      )}

      {/* Phase Modal (Create) */}
      {phaseModal.isOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h2>Thêm Giai đoạn phác đồ mới</h2>
              <button
                onClick={() => setPhaseModal(prev => ({ ...prev, isOpen: false }))}
                className="admin-modal-close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={submitPhaseModal}>
              <div className="admin-modal-body">
                <div className="form-group-row">
                  <div className="form-field flex-1">
                    <label className="field-label-small">Số thứ tự Giai đoạn *</label>
                    <input
                      type="number"
                      min={1}
                      className="week-desc-input w-full mt-1"
                      value={phaseModal.phaseNumber}
                      onChange={(e) => setPhaseModal({ ...phaseModal, phaseNumber: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="form-field flex-1">
                    <label className="field-label-small">Nhãn Giai đoạn *</label>
                    <input
                      type="text"
                      className="week-desc-input w-full mt-1"
                      value={phaseModal.label}
                      onChange={(e) => setPhaseModal({ ...phaseModal, label: e.target.value })}
                      placeholder="Ví dụ: Làm Chủ Thói Quen..."
                      required
                    />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-field flex-1">
                    <label className="field-label-small">Khoảng ngày/tuần *</label>
                    <input
                      type="text"
                      className="week-desc-input w-full mt-1"
                      value={phaseModal.rangeText}
                      onChange={(e) => setPhaseModal({ ...phaseModal, rangeText: e.target.value })}
                      placeholder="Ví dụ: Ngày 121–150 hoặc Tuần 17-20..."
                      required
                    />
                  </div>
                  <div className="form-field flex-1">
                    <label className="field-label-small">Icon đại diện (Emoji) *</label>
                    <input
                      type="text"
                      className="week-desc-input w-full mt-1"
                      value={phaseModal.icon}
                      onChange={(e) => setPhaseModal({ ...phaseModal, icon: e.target.value })}
                      placeholder="🧠, ⚡, 🧭, 🏆..."
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label-small">Mục tiêu Giai đoạn (Focus) *</label>
                  <textarea
                    className="field-textarea"
                    value={phaseModal.focus}
                    onChange={(e) => setPhaseModal({ ...phaseModal, focus: e.target.value })}
                    placeholder="Mô tả mục tiêu của giai đoạn..."
                    rows={2}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="field-label-small">Cơ sở Khoa học (Science) *</label>
                  <textarea
                    className="field-textarea"
                    value={phaseModal.science}
                    onChange={(e) => setPhaseModal({ ...phaseModal, science: e.target.value })}
                    placeholder="Các lý thuyết/nghiên cứu khoa học thần kinh hỗ trợ..."
                    rows={2}
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setPhaseModal(prev => ({ ...prev, isOpen: false }))}
                  className="btn-cancel-modal"
                >
                  Hủy
                </button>
                <button type="submit" className="btn-confirm-modal-save">
                  <Plus size={16} /> Tạo giai đoạn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal (Create/Edit) */}
      {taskModal.isOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h2>{taskModal.mode === 'create' ? 'Thêm nhiệm vụ mới' : 'Chỉnh sửa nhiệm vụ'}</h2>
              <button
                onClick={() => setTaskModal(prev => ({ ...prev, isOpen: false }))}
                className="admin-modal-close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={submitTaskModal}>
              <div className="admin-modal-body">
                <div className="form-field">
                  <label className="field-label-small">Tiêu đề nhiệm vụ *</label>
                  <textarea
                    className="field-textarea"
                    value={taskModal.title}
                    onChange={(e) => setTaskModal({ ...taskModal, title: e.target.value })}
                    placeholder="Mô tả nhiệm vụ cụ thể..."
                    rows={3}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="field-label-small">Mô tả bổ sung (Sub-text - Không bắt buộc)</label>
                  <textarea
                    className="field-textarea"
                    value={taskModal.subText}
                    onChange={(e) => setTaskModal({ ...taskModal, subText: e.target.value })}
                    placeholder="Hướng dẫn thực hiện chi tiết hoặc kiến thức khoa học bổ sung..."
                    rows={2}
                  />
                </div>
                <div className="form-group-row">
                  <div className="form-field flex-1">
                    <label className="field-label-small">Nhãn nhiệm vụ (Badge)</label>
                    <select
                      className="week-desc-input w-full"
                      value={taskModal.badge}
                      onChange={(e) => setTaskModal({ ...taskModal, badge: e.target.value })}
                      style={{ height: '42px', marginTop: '0.25rem' }}
                    >
                      <option value="BẮT BUỘC">Bắt buộc</option>
                      <option value="KHUYÊN DÙNG">Khuyên dùng</option>
                      <option value="THỂ CHẤT">Thể chất</option>
                      <option value="TINH THẦN">Tinh thần</option>
                    </select>
                  </div>
                  <div className="form-field flex-1">
                    <label className="field-label-small">Thứ tự ưu tiên (Index)</label>
                    <input
                      type="number"
                      min={0}
                      className="week-desc-input w-full"
                      value={taskModal.taskIndex}
                      onChange={(e) => setTaskModal({ ...taskModal, taskIndex: parseInt(e.target.value) })}
                      style={{ height: '42px', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setTaskModal(prev => ({ ...prev, isOpen: false }))}
                  className="btn-cancel-modal"
                >
                  Hủy
                </button>
                <button type="submit" className="btn-confirm-modal-save">
                  <Save size={16} /> Lưu nhiệm vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Metric Modal (Create/Edit) */}
      {metricModal.isOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container max-w-sm">
            <div className="admin-modal-header">
              <h2>{metricModal.mode === 'create' ? 'Thêm chỉ số đo lường' : 'Sửa tên chỉ số'}</h2>
              <button
                onClick={() => setMetricModal(prev => ({ ...prev, isOpen: false }))}
                className="admin-modal-close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={submitMetricModal}>
              <div className="admin-modal-body">
                <div className="form-field">
                  <label className="field-label-small">Tên chỉ số *</label>
                  <input
                    type="text"
                    className="week-desc-input w-full mt-1"
                    value={metricModal.metricName}
                    onChange={(e) => setMetricModal({ ...metricModal, metricName: e.target.value })}
                    placeholder="Ví dụ: Mức độ thôi thúc (1-10)..."
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setMetricModal(prev => ({ ...prev, isOpen: false }))}
                  className="btn-cancel-modal"
                >
                  Hủy
                </button>
                <button type="submit" className="btn-confirm-modal-save">
                  <Save size={16} /> Lưu chỉ số
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type="danger"
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
      />
    </div>
  );
}
