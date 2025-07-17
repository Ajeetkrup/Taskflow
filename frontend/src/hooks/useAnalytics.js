import { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';

export const useAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [productivity, setProductivity] = useState(null);
  const [categoryStats, setCategoryStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [overviewData, productivityData, categoryData, trendsData] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getProductivity(),
        analyticsService.getCategoryStats(),
        analyticsService.getTrends()
      ]);

      setOverview(overviewData);
      setProductivity(productivityData);
      setCategoryStats(categoryData);
      setTrends(trendsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    overview,
    productivity,
    categoryStats,
    trends,
    loading,
    error,
    refetch: fetchAnalytics
  };
};