const { query } = require('../utils/database');
const bcrypt = require('bcrypt');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.email = userData.email;
    this.firstName = userData.first_name;
    this.lastName = userData.last_name;
    this.isActive = userData.is_active;
    this.createdAt = userData.created_at;
    this.updatedAt = userData.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { email, password, firstName, lastName } = userData;
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const createUserQuery = `
      INSERT INTO users (email, password, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name, is_active, created_at, updated_at
    `;
    
    const result = await query(createUserQuery, [
      email,
      hashedPassword,
      firstName,
      lastName
    ]);
    
    return new User(result.rows[0]);
  }

  // Find user by email
  static async findByEmail(email) {
    const findUserQuery = `
      SELECT id, email, password, first_name, last_name, is_active, created_at, updated_at
      FROM users
      WHERE email = $1 AND is_active = true
    `;
    
    const result = await query(findUserQuery, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      ...new User(result.rows[0]),
      password: result.rows[0].password // Include password for authentication
    };
  }

  // Find user by ID
  static async findById(id) {
    const findUserQuery = `
      SELECT id, email, first_name, last_name, is_active, created_at, updated_at
      FROM users
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await query(findUserQuery, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new User(result.rows[0]);
  }

  // Update user profile
  static async updateProfile(id, updateData) {
    const { firstName, lastName } = updateData;
    
    const updateUserQuery = `
      UPDATE users 
      SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND is_active = true
      RETURNING id, email, first_name, last_name, is_active, created_at, updated_at
    `;
    
    const result = await query(updateUserQuery, [firstName, lastName, id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new User(result.rows[0]);
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const updatePasswordQuery = `
      UPDATE users 
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND is_active = true
      RETURNING id
    `;
    
    const result = await query(updatePasswordQuery, [hashedPassword, id]);
    return result.rows.length > 0;
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Check if email exists
  static async emailExists(email) {
    const checkEmailQuery = `
      SELECT id FROM users WHERE email = $1
    `;
    
    const result = await query(checkEmailQuery, [email]);
    return result.rows.length > 0;
  }

  // Deactivate user (soft delete)
  static async deactivate(id) {
    const deactivateQuery = `
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await query(deactivateQuery, [id]);
    return result.rows.length > 0;
  }

  // Convert to JSON (remove sensitive data)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;