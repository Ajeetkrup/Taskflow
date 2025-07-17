import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import AnalyticsOverview from './AnalyticsOverview';
import ProductivityChart from './ProductivityChart';
import CategoryStats from './CategoryStats';
import Loader from '../common/Loader';

const AnalyticsDashboard = () => {
  const { overview, productivity, categoryStats, loading, error, refetch } = useAnalytics();

  if (loading) return <Loader />;
  
  if (error) {
    return (
      <div className="analytics-error">
        <p>Error loading analytics: {error}</p>
        <button onClick={refetch} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h2>Analytics Dashboard</h2>
        <button onClick={refetch} className="refresh-btn">Refresh</button>
      </div>
      
      <div className="analytics-grid">
        <div className="analytics-section">
          <AnalyticsOverview data={overview} />
        </div>
        
        <div className="analytics-section">
          <ProductivityChart data={productivity} />
        </div>
        
        <div className="analytics-section">
          <CategoryStats data={categoryStats} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;