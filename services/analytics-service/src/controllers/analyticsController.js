const { pool } = require('../utils/database');
const { getSession, setSession, deleteSession, client: redisClient } = require('../utils/redis');

class AnalyticsController {
  // Get overall task statistics
  async getOverview(req, res) {
    try {
      const userId = req.user.id;
      const cacheKey = `analytics:overview:${userId}`;

      // Check cache first using helper function
      const cached = await getSession(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const query = `
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
          COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_tasks,
          COUNT(CASE WHEN due_date < NOW() AND status != 'completed' THEN 1 END) as overdue_tasks,
          COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tasks,
          COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_tasks,
          COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_tasks
        FROM tasks 
        WHERE user_id = $1
      `;

      const result = await pool.query(query, [userId]);
      const stats = result.rows[0];

      // Calculate completion rate
      const completionRate = stats.total_tasks > 0
        ? ((stats.completed_tasks / stats.total_tasks) * 100).toFixed(1)
        : 0;

      const overview = {
        ...stats,
        completion_rate: parseFloat(completionRate || 0),
        total_tasks: parseInt(stats.total_tasks || 0),
        completed_tasks: parseInt(stats.completed_tasks),
        pending_tasks: parseInt(stats.pending_tasks),
        in_progress_tasks: parseInt(stats.in_progress_tasks),
        overdue_tasks: parseInt(stats.overdue_tasks),
        high_priority_tasks: parseInt(stats.high_priority_tasks),
        medium_priority_tasks: parseInt(stats.medium_priority_tasks),
        low_priority_tasks: parseInt(stats.low_priority_tasks)
      };

      // Cache for 5 minutes using helper function
      await setSession(cacheKey, overview, 300);

      res.json(overview);
    } catch (error) {
      console.error('Error fetching overview:', error);
      res.status(500).json({ error: 'Failed to fetch analytics overview' });
    }
  }

  // Get productivity metrics
  async getProductivity(req, res) {
    try {
      const userId = req.user.id;
      const cacheKey = `analytics:productivity:${userId}`;

      const cached = await getSession(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const query = `
        SELECT 
          DATE_TRUNC('day', created_at) as date,
          COUNT(*) as tasks_created,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as tasks_completed
        FROM tasks 
        WHERE user_id = $1 
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date DESC
        LIMIT 30
      `;

      const result = await pool.query(query, [userId]);

      const productivity = {
        daily_stats: result.rows.map(row => ({
          date: row?.date?.toISOString()?.split('T')[0],
          tasks_created: parseInt(row?.tasks_created),
          tasks_completed: parseInt(row?.tasks_completed)
        })),
        avg_daily_completion: result?.rows?.length > 0
          ? (result.rows.reduce((sum, row) => sum + parseInt(row?.tasks_completed), 0) / result?.rows?.length).toFixed(1)
          : 0
      };

      // Cache for 10 minutes
      await setSession(cacheKey, productivity, 600);

      res.json(productivity);
    } catch (error) {
      console.error('Error fetching productivity:', error);
      res.status(500).json({ error: 'Failed to fetch productivity metrics' });
    }
  }

  // Get category-wise statistics
  async getCategoryStats(req, res) {
    try {
      const userId = req.user.id;
      const cacheKey = `analytics:categories:${userId}`;

      const cached = await getSession(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const query = `
        SELECT 
          COALESCE(category, 'Uncategorized') as category,
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
          COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_tasks
        FROM tasks 
        WHERE user_id = $1
        GROUP BY category
        ORDER BY total_tasks DESC
      `;

      const result = await pool.query(query, [userId]);

      const categoryStats = result.rows.map(row => ({
        category: row.category,
        total_tasks: parseInt(row.total_tasks),
        completed_tasks: parseInt(row.completed_tasks),
        pending_tasks: parseInt(row.pending_tasks),
        in_progress_tasks: parseInt(row.in_progress_tasks),
        completion_rate: row.total_tasks > 0
          ? ((row.completed_tasks / row.total_tasks) * 100).toFixed(1)
          : 0
      }));

      // Cache for 10 minutes
      await setSession(cacheKey, categoryStats, 600);

      res.json(categoryStats);
    } catch (error) {
      console.error('Error fetching category stats:', error);
      res.status(500).json({ error: 'Failed to fetch category statistics' });
    }
  }

  // Get task completion trends
  async getTrends(req, res) {
    try {
      const userId = req.user.id;
      const { period = '7d' } = req.query;
      const cacheKey = `analytics:trends:${userId}:${period}`;

      const cached = await getSession(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      let interval = '7 days';
      let dateFormat = 'day';

      if (period === '30d') {
        interval = '30 days';
        dateFormat = 'day';
      } else if (period === '90d') {
        interval = '90 days';
        dateFormat = 'week';
      }

      const query = `
        SELECT 
          DATE_TRUNC('${dateFormat}', updated_at) as period,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
        FROM tasks 
        WHERE user_id = $1 
          AND updated_at >= NOW() - INTERVAL '${interval}'
          AND status = 'completed'
        GROUP BY DATE_TRUNC('${dateFormat}', updated_at)
        ORDER BY period ASC
      `;

      const result = await pool.query(query, [userId]);

      const trends = {
        period: period,
        data: result.rows.map(row => ({
          period: row.period.toISOString().split('T')[0],
          completed_tasks: parseInt(row.completed_count)
        }))
      };

      // Cache for 15 minutes
      await setSession(cacheKey, trends, 900);

      res.json(trends);
    } catch (error) {
      console.error('Error fetching trends:', error);
      res.status(500).json({ error: 'Failed to fetch task trends' });
    }
  }

  // Clear specific cache
  async clearCache(req, res) {
    try {
      const userId = req.user.id;
      const { type } = req.query; // overview, productivity, categories, trends

      if (type === 'overview') {
        await deleteSession(`analytics:overview:${userId}`);
        return res.json({ message: 'Overview cache cleared successfully' });
      } else if (type === 'productivity') {
        await deleteSession(`analytics:productivity:${userId}`);
        return res.json({ message: 'Productivity cache cleared successfully' });
      } else if (type === 'categories') {
        await deleteSession(`analytics:categories:${userId}`);
        return res.json({ message: 'Categories cache cleared successfully' });
      } else if (type === 'trends') {
        // Clear all trend variations
        const trendKeys = [
          `analytics:trends:${userId}:7d`,
          `analytics:trends:${userId}:30d`,
          `analytics:trends:${userId}:90d`
        ];

        for (const key of trendKeys) {
          await deleteSession(key);
        }

        return res.json({ message: 'Trends cache cleared successfully' });
      } else {
        // Clear all analytics cache for user
        const patterns = [
          `analytics:overview:${userId}`,
          `analytics:productivity:${userId}`,
          `analytics:categories:${userId}`,
          `analytics:trends:${userId}:7d`,
          `analytics:trends:${userId}:30d`,
          `analytics:trends:${userId}:90d`
        ];

        for (const key of patterns) {
          await deleteSession(key);
        }

        return res.json({ message: 'All analytics cache cleared successfully' });
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({ error: 'Failed to clear cache' });
    }
  }

  // Get cache status
  async getCacheStatus(req, res) {
    try {
      const userId = req.user.id;

      const cacheKeys = [
        `analytics:overview:${userId}`,
        `analytics:productivity:${userId}`,
        `analytics:categories:${userId}`,
        `analytics:trends:${userId}:7d`,
        `analytics:trends:${userId}:30d`,
        `analytics:trends:${userId}:90d`
      ];

      const cacheStatus = {};

      for (const key of cacheKeys) {
        const cached = await redisClient.get(key);
        const keyName = key.split(':')[1] + (key.includes('trends') ? ':' + key.split(':')[3] : '');
        cacheStatus[keyName] = {
          exists: !!cached,
          size: cached ? JSON.stringify(cached).length : 0
        };
      }

      res.json(cacheStatus);
    } catch (error) {
      console.error('Error getting cache status:', error);
      res.status(500).json({ error: 'Failed to get cache status' });
    }
  }
}

module.exports = new AnalyticsController();