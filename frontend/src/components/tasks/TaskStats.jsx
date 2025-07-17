import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { taskService } from '../../services/taskService';

const TaskStats = ({ compact = false, useHook = true }) => {
  // State for direct service calls
  const [stats, setStats] = useState(null);
  const [directLoading, setDirectLoading] = useState(false);
  
  // Hook-based data fetching
  const { overview, loading: hookLoading } = useAnalytics();

  // Determine which data source to use
  const loading = useHook ? hookLoading : directLoading;
  const data = useHook ? overview : stats;

  // Effect for direct service calls when not using hook
  useEffect(() => {
    if (!useHook) {
      fetchStats();
    }
  }, [useHook]);

  const fetchStats = async () => {
    try {
      setDirectLoading(true);
      const statsData = await taskService.getTaskStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setDirectLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return <div>Loading stats...</div>;
  }

  // No data state
  if (!data) return null;

  // Calculate completion rate for direct service data
  const completionRate = useHook 
    ? data.completion_rate 
    : data.total_tasks > 0 
      ? Math.round((data.completed_tasks / data.total_tasks) * 100) 
      : 0;

  // Normalize data structure
  const normalizedData = {
    total_tasks: data.total_tasks,
    completed_tasks: data.completed_tasks,
    pending_tasks: data.pending_tasks || (data.total_tasks - data.completed_tasks - (data.overdue_tasks || 0)),
    overdue_tasks: data.overdue_tasks || 0,
    completion_rate: completionRate
  };

  // Compact mode rendering
  if (compact) {
    return (
      <div className="stats-compact">
        <div className="stat-compact">
          <div className="stat-number">
            {normalizedData.total_tasks}
          </div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-compact">
          <div className="stat-number">
            {normalizedData.completed_tasks}
          </div>
          <div className="stat-label">Done</div>
        </div>
        <div className="stat-compact">
          <div className="stat-number">
            {normalizedData.completion_rate}%
          </div>
          <div className="stat-label">Rate</div>
        </div>
      </div>
    );
  }

  // Full mode rendering
  return (
    <div className="task-stats">
      <h3>Task Statistics</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-number">{normalizedData.total_tasks}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{normalizedData.completed_tasks}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{normalizedData.pending_tasks}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{normalizedData.overdue_tasks}</span>
          <span className="stat-label">Overdue</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{normalizedData.completion_rate}%</span>
          <span className="stat-label">Completion Rate</span>
        </div>
      </div>
    </div>
  );
};

export default TaskStats;