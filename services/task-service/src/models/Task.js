const { pool } = require('../utils/database');

class Task {
  static async create(userId, taskData) {
    const { title, description, category, priority, due_date } = taskData;
    const query = `
      INSERT INTO tasks (user_id, title, description, category, priority, due_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [userId, title, description, category, priority || 'medium', due_date];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT * FROM tasks 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findById(id, userId) {
    const query = `
      SELECT * FROM tasks 
      WHERE id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  static async update(id, userId, taskData) {
    const { title, description, category, priority, status, due_date } = taskData;
    const query = `
      UPDATE tasks 
      SET title = $1, description = $2, category = $3, priority = $4, 
          status = $5, due_date = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND user_id = $8
      RETURNING *
    `;
    const values = [title, description, category, priority, status, due_date, id, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id, userId) {
    const query = `
      DELETE FROM tasks 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  static async findByCategory(userId, category) {
    const query = `
      SELECT * FROM tasks 
      WHERE user_id = $1 AND category = $2
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId, category]);
    return result.rows;
  }

  static async getStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN due_date < NOW() AND status != 'completed' THEN 1 END) as overdue_tasks
      FROM tasks 
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = Task;
