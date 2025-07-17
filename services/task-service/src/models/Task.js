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

    // Check if title is provided (required field)
    if (!title) {
      throw new Error('Title is required');
    }

    // Build dynamic query based on provided fields
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Title is always updated (required)
    updateFields.push(`title = $${paramIndex++}`);
    values.push(title);

    // Add other fields only if they are provided
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(description);
    }

    if (category !== undefined) {
      updateFields.push(`category = $${paramIndex++}`);
      values.push(category);
    }

    if (priority !== undefined) {
      updateFields.push(`priority = $${paramIndex++}`);
      values.push(priority);
    }

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (due_date !== undefined) {
      updateFields.push(`due_date = $${paramIndex++}`);
      values.push(due_date);
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add WHERE clause parameters
    const whereClause = `WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}`;
    values.push(id, userId);

    const query = `
    UPDATE tasks
    SET ${updateFields.join(', ')}
    ${whereClause}
    RETURNING *
  `;

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