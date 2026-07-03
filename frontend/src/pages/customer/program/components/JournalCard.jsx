import React from 'react';

export default function JournalCard({
  journal,
  onJournalChange,
  isEditable = true,
  isEditing = true
}) {
  const handlePromptClick = (promptText) => {
    if (!isEditable || !isEditing) return;
    if (typeof onJournalChange === 'function') {
      const updatedVal = (prev) => {
        const prevStr = prev || '';
        const spacing = prevStr ? '\n\n' : '';
        return `${prevStr}${spacing}* ${promptText}\n- `;
      };
      onJournalChange(updatedVal);
    }
  };

  return (
    <div className="pd-journal-block">
      <div className="pd-section-head">
        <h2 className="pd-section-title">
          <span>Quan sát của bạn</span>
        </h2>
      </div>

      <div className="pd-journal-card">
        {(isEditable && isEditing) && (
          <div style={{ marginBottom: '1rem' }}>
            <div className="pd-journal-prompts-header">Gợi ý:</div>
            <div className="pd-journal-prompts-chips">
              <span
                className="pd-journal-prompt-chip"
                onClick={() => handlePromptClick('Hôm nay bạn nhận ra điều gì?')}
              >
                💡 Nhận ra điều gì?
              </span>
              <span
                className="pd-journal-prompt-chip"
                onClick={() => handlePromptClick('Lúc nào bạn muốn cầm điện thoại nhất?')}
              >
                📱 Lúc nào muốn cầm máy?
              </span>
              <span
                className="pd-journal-prompt-chip"
                onClick={() => handlePromptClick('Điều gì giúp bạn quay lại nhịp?')}
              >
                🔄 Điều gì giúp quay lại?
              </span>
            </div>
          </div>
        )}
        <textarea
          className="pd-journal-textarea"
          placeholder="Viết tự do về nhận thức hôm nay..."
          value={journal || ''}
          onChange={e => onJournalChange(e.target.value)}
          disabled={!isEditable || !isEditing}
        />
        <div className="pd-journal-footer pd-journal-footer-right">
          <span className="pd-journal-chars">{(journal || '').length} ký tự</span>
        </div>
      </div>
    </div>
  );
}
