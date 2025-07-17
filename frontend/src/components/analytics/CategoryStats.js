import React from 'react';

const CategoryStats = ({ data }) => {
  if (!data || !data.length) return <div className="loading">Loading categories...</div>;

  return (
    <div className="category-stats">
      <h3>Category Breakdown</h3>
      <div className="category-list">
        {data.map((category, index) => (
          <div key={index} className="category-item">
            <div className="category-header">
              <span className="category-name">{category.category}</span>
              <span className="category-total">{category.total_tasks} tasks</span>
            </div>
            
            <div className="category-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${category.completion_rate}%` }}
              ></div>
            </div>
            
            <div className="category-details">
              <div className="detail-item">
                <span className="detail-label">Completed:</span>
                <span className="detail-value">{category.completed_tasks}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Pending:</span>
                <span className="detail-value">{category.pending_tasks}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Rate:</span>
                <span className="detail-value">{category.completion_rate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryStats;