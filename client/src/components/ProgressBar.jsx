import React from 'react';

export default function ProgressBar({ value, label, color }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const progressColor = color || (safeValue > 90 ? '#ef4444' : safeValue > 60 ? '#f59e0b' : '#10b981');

  return (
    <div className="progress-block">
      {label ? <div className="progress-label">{label}</div> : null}
      <div className="progress-shell">
        <div className="progress-fill" style={{ width: `${safeValue}%`, background: progressColor }} />
      </div>
      <div className="progress-value">{safeValue.toFixed(0)}%</div>
    </div>
  );
}
