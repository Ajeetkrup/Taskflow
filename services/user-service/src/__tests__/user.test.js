const User = require('../models/User');
const bcrypt = require('bcrypt');

// Mock the database query function
jest.mock('../utils/database', () => ({
  query: jest.fn()
}));

// Mock bcrypt
jest.mock('bcrypt');

const { query } = require('../utils/database');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a User instance with correct properties', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      const user = new User(userData);

      expect(user.id).toBe(userData.id);
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.first_name);
      expect(user.lastName).toBe(userData.last_name);
      expect(user.isActive).toBe(userData.is_active);
      expect(user.createdAt).toBe(userData.created_at);
      expect(user.updatedAt).toBe(userData.updated_at);
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockHashedPassword = 'hashedPassword123';
      const mockDbResult = {
        rows: [{
          id: 1,
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }]
      };

      bcrypt.hash.mockResolvedValue(mockHashedPassword);
      query.mockResolvedValue(mockDbResult);

      const result = await User.create(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [userData.email, mockHashedPassword, userData.firstName, userData.lastName]
      );
      expect(result).toBeInstanceOf(User);
      expect(result.email).toBe(userData.email);
    });

    it('should throw error if database query fails', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      bcrypt.hash.mockResolvedValue('hashedPassword');
      query.mockRejectedValue(new Error('Database error'));

      await expect(User.create(userData)).rejects.toThrow('Database error');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      const email = 'test@example.com';
      const mockDbResult = {
        rows: [{
          id: 1,
          email: 'test@example.com',
          password: 'hashedPassword',
          first_name: 'John',
          last_name: 'Doe',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }]
      };

      query.mockResolvedValue(mockDbResult);

      const result = await User.findByEmail(email);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, email, password'),
        [email]
      );
      expect(result.email).toBe(email);
      expect(result.password).toBe('hashedPassword');
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';
      query.mockResolvedValue({ rows: [] });

      const result = await User.findByEmail(email);

      expect(result).toBeNull();
    });

    it('should throw error if database query fails', async () => {
      const email = 'test@example.com';
      query.mockRejectedValue(new Error('Database error'));

      await expect(User.findByEmail(email)).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should find user by ID successfully', async () => {
      const userId = 1;
      const mockDbResult = {
        rows: [{
          id: 1,
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }]
      };

      query.mockResolvedValue(mockDbResult);

      const result = await User.findById(userId);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, email, first_name'),
        [userId]
      );
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(userId);
    });

    it('should return null if user not found', async () => {
      const userId = 999;
      query.mockResolvedValue({ rows: [] });

      const result = await User.findById(userId);

      expect(result).toBeNull();
    });

    it('should throw error if database query fails', async () => {
      const userId = 1;
      query.mockRejectedValue(new Error('Database error'));

      await expect(User.findById(userId)).rejects.toThrow('Database error');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = 1;
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith'
      };

      const mockDbResult = {
        rows: [{
          id: 1,
          email: 'test@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }]
      };

      query.mockResolvedValue(mockDbResult);

      const result = await User.updateProfile(userId, updateData);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [updateData.firstName, updateData.lastName, userId]
      );
      expect(result).toBeInstanceOf(User);
      expect(result.firstName).toBe(updateData.firstName);
    });

    it('should return null if user not found', async () => {
      const userId = 999;
      const updateData = { firstName: 'Jane', lastName: 'Smith' };
      query.mockResolvedValue({ rows: [] });

      const result = await User.updateProfile(userId, updateData);

      expect(result).toBeNull();
    });

    it('should throw error if database query fails', async () => {
      const userId = 1;
      const updateData = { firstName: 'Jane', lastName: 'Smith' };
      query.mockRejectedValue(new Error('Database error'));

      await expect(User.updateProfile(userId, updateData)).rejects.toThrow('Database error');
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const userId = 1;
      const newPassword = 'newPassword123';
      const mockHashedPassword = 'newHashedPassword';

      bcrypt.hash.mockResolvedValue(mockHashedPassword);
      query.mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await User.updatePassword(userId, newPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [mockHashedPassword, userId]
      );
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      const userId = 999;
      const newPassword = 'newPassword123';

      bcrypt.hash.mockResolvedValue('hashedPassword');
      query.mockResolvedValue({ rows: [] });

      const result = await User.updatePassword(userId, newPassword);

      expect(result).toBe(false);
    });

    it('should throw error if bcrypt fails', async () => {
      const userId = 1;
      const newPassword = 'newPassword123';

      bcrypt.hash.mockRejectedValue(new Error('Hash error'));

      await expect(User.updatePassword(userId, newPassword)).rejects.toThrow('Hash error');
    });
  });

  describe('verifyPassword', () => {
    it('should verify password successfully when passwords match', async () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashedPassword';

      bcrypt.compare.mockResolvedValue(true);

      const result = await User.verifyPassword(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false when passwords do not match', async () => {
      const plainPassword = 'wrongPassword';
      const hashedPassword = 'hashedPassword';

      bcrypt.compare.mockResolvedValue(false);

      const result = await User.verifyPassword(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(false);
    });

    it('should throw error if bcrypt compare fails', async () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashedPassword';

      bcrypt.compare.mockRejectedValue(new Error('Compare error'));

      await expect(User.verifyPassword(plainPassword, hashedPassword)).rejects.toThrow('Compare error');
    });
  });

  describe('emailExists', () => {
    it('should return true if email exists', async () => {
      const email = 'test@example.com';
      query.mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await User.emailExists(email);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id FROM users'),
        [email]
      );
      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      const email = 'nonexistent@example.com';
      query.mockResolvedValue({ rows: [] });

      const result = await User.emailExists(email);

      expect(result).toBe(false);
    });

    it('should throw error if database query fails', async () => {
      const email = 'test@example.com';
      query.mockRejectedValue(new Error('Database error'));

      await expect(User.emailExists(email)).rejects.toThrow('Database error');
    });
  });

  describe('deactivate', () => {
    it('should deactivate user successfully', async () => {
      const userId = 1;
      query.mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await User.deactivate(userId);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [userId]
      );
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      const userId = 999;
      query.mockResolvedValue({ rows: [] });

      const result = await User.deactivate(userId);

      expect(result).toBe(false);
    });

    it('should throw error if database query fails', async () => {
      const userId = 1;
      query.mockRejectedValue(new Error('Database error'));

      await expect(User.deactivate(userId)).rejects.toThrow('Database error');
    });
  });

  describe('getActiveUsersCount', () => {
    it('should return active users count', async () => {
      const mockDbResult = { rows: [{ count: '5' }] };
      query.mockResolvedValue(mockDbResult);

      const result = await User.getActiveUsersCount();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count')
      );
      expect(result).toBe(5);
    });

    it('should return 0 if no active users', async () => {
      const mockDbResult = { rows: [{ count: '0' }] };
      query.mockResolvedValue(mockDbResult);

      const result = await User.getActiveUsersCount();

      expect(result).toBe(0);
    });

    it('should throw error if database query fails', async () => {
      query.mockRejectedValue(new Error('Database error'));

      await expect(User.getActiveUsersCount()).rejects.toThrow('Database error');
    });
  });

  describe('toJSON', () => {
    it('should return user object without sensitive data', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      const user = new User(userData);
      const result = user.toJSON();

      expect(result).toEqual({
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        isActive: userData.is_active,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      });
      expect(result.password).toBeUndefined();
    });
  });
});