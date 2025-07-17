import { analyticsApiClient } from './apiClient';

class AnalyticsService {
  async getOverview() {
    const response = await analyticsApiClient.get('/api/analytics/overview');
    return response.data;
  }

  async getProductivity() {
    const response = await analyticsApiClient.get('/api/analytics/productivity');
    return response.data;
  }

  async getCategoryStats() {
    const response = await analyticsApiClient.get('/api/analytics/categories');
    return response.data;
  }

  async getTrends(period = '7d') {
    const response = await analyticsApiClient.get(`/api/analytics/trends?period=${period}`);
    return response.data;
  }
}

export default new AnalyticsService();