import React from 'react';

const ProductivityChart = ({ data }) => {
  if (!data || !data.daily_stats) return <div className="loading">Loading productivity...</div>;

  const maxValue = Math.max(...data.daily_stats.map(d => Math.max(d.tasks_created, d.tasks_completed)));
  const recentStats = data.daily_stats.slice(0, 7).reverse(); // Show last 7 days

  return (
    <div className="productivity-chart">
      <h3>Productivity Trends</h3>
      <div className="chart-info">
        <span>Average Daily Completion: {data.avg_daily_completion}</span>
      </div>
      
      <div className="chart-container">
        <div className="chart-bars">
          {recentStats.map((day, index) => (
            <div key={index} className="day-group">
              <div className="bars">
                <div 
                  className="bar created" 
                  style={{ height: `${(day.tasks_created / maxValue) * 100}%` }}
                  title={`Created: ${day.tasks_created}`}
                ></div>
                <div 
                  className="bar completed" 
                  style={{ height: `${(day.tasks_completed / maxValue) * 100}%` }}
                  title={`Completed: ${day.tasks_completed}`}
                ></div>
              </div>
              <div className="day-label">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color created"></div>
            <span>Created</span>
          </div>
          <div className="legend-item">
            <div className="legend-color completed"></div>
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityChart;