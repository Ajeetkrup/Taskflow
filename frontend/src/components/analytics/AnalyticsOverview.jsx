import React from 'react';

const AnalyticsOverview = ({ data }) => {
  if (!data) return <div className="loading">Loading overview...</div>;

  const stats = [
    { label: 'Total Tasks', value: data.total_tasks, color: 'blue' },
    { label: 'Completed', value: data.completed_tasks, color: 'green' },
    { label: 'Pending', value: data.pending_tasks, color: 'orange' },
    { label: 'Overdue', value: data.overdue_tasks, color: 'red' }
  ];

  return (
    <div className="analytics-overview">
      <h3>Task Overview</h3>
      <div className="stats-grid">
        {stats.map(stat => (
          <div key={stat.label} className={`stat-card ${stat.color}`}>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="completion-rate">
        <div className="rate-label">Completion Rate</div>
        <div className="rate-bar">
          <div 
            className="rate-fill" 
            style={{ width: `${data.completion_rate}%` }}
          ></div>
        </div>
        <div className="rate-text">{data.completion_rate}%</div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;