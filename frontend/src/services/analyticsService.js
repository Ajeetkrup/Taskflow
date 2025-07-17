import apiClient from './apiClient';

class AnalyticsService {
  async getOverview() {
    const response = await apiClient.get('/analytics/overview');
    return response.data;
  }

  async getProductivity() {
    const response = await apiClient.get('/analytics/productivity');
    return response.data;
  }

  async getCategoryStats() {
    const response = await apiClient.get('/analytics/categories');
    return response.data;
  }

  async getTrends(period = '7d') {
    const response = await apiClient.get(`/analytics/trends?period=${period}`);
    return response.data;
  }
}

export default new AnalyticsService();