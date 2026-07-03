import React from 'react';
import { Check } from 'lucide-react';

export default function TodayTasksCard({
  tasks = [],
  onToggleTask,
  dayNumber
}) {
  const completedCount = tasks.filter(t => t.done).length;
  const remaining = tasks.length - completedCount;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="pd-today-block">
      <div className="pd-section-head">
        <h2 className="pd-section-title">
          <span>Việc giữ nhịp Ngày {dayNumber}</span>
        </h2>
        <span className="pd-section-stats">
          {completedCount}/{tasks.length} hoàn thành
        </span>
      </div>

      {/* Status label only — progress bar is already in Hero Summary Card */}
      {tasks.length > 0 && (
        <div className="pd-tasks-status-label">
          {remaining > 0
            ? `Còn ${remaining} việc cần hoàn thành`
            : '✨ Đã hoàn thành tất cả'}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="pd-no-tasks-state">
          Không có việc giữ nhịp nào cho ngày hôm nay.
        </div>
      ) : (
        <div className="pd-task-list">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`pd-task-card ${task.done ? 'done' : ''}`}
              onClick={() => onToggleTask(task.id, !task.done)}
            >
              <div className="pd-task-check-wrap">
                <div className={`pd-task-check-box ${task.done ? 'checked' : ''}`}>
                  {task.done && <Check size={14} />}
                </div>
              </div>

              <div className="pd-task-body">
                <div className="pd-task-title">{task.title}</div>
                {task.sub && <div className="pd-task-sub">{task.sub}</div>}
              </div>

              {task.badge && (
                <div className={`pd-task-badge ${task.done ? 'done-badge' : ''}`}>
                  {task.badge}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
