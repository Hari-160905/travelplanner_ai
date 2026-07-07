import React from 'react';

export default function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon">{icon}</div>
      <div>
        <div className="stat-card__title">{title}</div>
        <div className="stat-card__value">{value}</div>
        {subtitle ? <div className="stat-card__subtitle">{subtitle}</div> : null}
      </div>
    </div>
  );
}
