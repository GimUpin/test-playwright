const database = require('../config/database');
const logger = require('../utils/logger');

class DatabaseService {
  constructor() {
    this.db = database;
  }

  // Test database connection
  async testConnection() {
    return await this.db.testConnection();
  }

  // User related operations
  async createUser(userData) {
    try {
      const query = `
        INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth, address, city, postal_code, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id, email, created_at
      `;
      
      const values = [
        userData.email,
        userData.passwordHash,
        userData.firstName,
        userData.lastName,
        userData.phone,
        userData.dateOfBirth,
        userData.address,
        userData.city,
        userData.postalCode
      ];

      const result = await this.db.query(query, values);
      logger.info('User created in database', { userId: result.rows[0].id, email: userData.email });
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create user', { error: error.message, userData });
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await this.db.query(query, [email]);
      
      if (result.rows.length > 0) {
        logger.info('User found by email', { email, userId: result.rows[0].id });
        return result.rows[0];
      }
      
      logger.info('User not found by email', { email });
      return null;
    } catch (error) {
      logger.error('Failed to get user by email', { error: error.message, email });
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await this.db.query(query, [userId]);
      
      if (result.rows.length > 0) {
        logger.info('User found by ID', { userId });
        return result.rows[0];
      }
      
      logger.info('User not found by ID', { userId });
      return null;
    } catch (error) {
      logger.error('Failed to get user by ID', { error: error.message, userId });
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const setClause = Object.keys(updateData)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const query = `
        UPDATE users 
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      
      const values = [userId, ...Object.values(updateData)];
      const result = await this.db.query(query, values);
      
      if (result.rows.length > 0) {
        logger.info('User updated successfully', { userId, updateData });
        return result.rows[0];
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to update user', { error: error.message, userId, updateData });
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
      const result = await this.db.query(query, [userId]);
      
      if (result.rows.length > 0) {
        logger.info('User deleted successfully', { userId });
        return result.rows[0];
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to delete user', { error: error.message, userId });
      throw error;
    }
  }

  // Test data cleanup operations
  async deleteTestUsers() {
    try {
      const query = "DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%example%'";
      const result = await this.db.query(query);
      logger.info('Test users deleted', { deletedCount: result.rowCount });
      return result.rowCount;
    } catch (error) {
      logger.error('Failed to delete test users', { error: error.message });
      throw error;
    }
  }

  async deleteUsersByEmailPattern(pattern) {
    try {
      const query = 'DELETE FROM users WHERE email LIKE $1';
      const result = await this.db.query(query, [`%${pattern}%`]);
      logger.info('Users deleted by email pattern', { pattern, deletedCount: result.rowCount });
      return result.rowCount;
    } catch (error) {
      logger.error('Failed to delete users by email pattern', { error: error.message, pattern });
      throw error;
    }
  }

  // Registration verification operations
  async createVerificationToken(userId, token, expiresAt) {
    try {
      const query = `
        INSERT INTO verification_tokens (user_id, token, expires_at, created_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
        token = $2, expires_at = $3, updated_at = NOW()
        RETURNING *
      `;
      
      const result = await this.db.query(query, [userId, token, expiresAt]);
      logger.info('Verification token created', { userId, token });
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create verification token', { error: error.message, userId });
      throw error;
    }
  }

  async getVerificationToken(token) {
    try {
      const query = `
        SELECT vt.*, u.email, u.first_name, u.last_name 
        FROM verification_tokens vt
        JOIN users u ON vt.user_id = u.id
        WHERE vt.token = $1 AND vt.expires_at > NOW()
      `;
      
      const result = await this.db.query(query, [token]);
      
      if (result.rows.length > 0) {
        logger.info('Verification token found', { token });
        return result.rows[0];
      }
      
      logger.info('Verification token not found or expired', { token });
      return null;
    } catch (error) {
      logger.error('Failed to get verification token', { error: error.message, token });
      throw error;
    }
  }

  async deleteVerificationToken(token) {
    try {
      const query = 'DELETE FROM verification_tokens WHERE token = $1 RETURNING *';
      const result = await this.db.query(query, [token]);
      
      if (result.rows.length > 0) {
        logger.info('Verification token deleted', { token });
        return result.rows[0];
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to delete verification token', { error: error.message, token });
      throw error;
    }
  }

  // Database utility operations
  async executeQuery(query, params = []) {
    try {
      const result = await this.db.query(query, params);
      logger.info('Custom query executed', { query, rowCount: result.rowCount });
      return result;
    } catch (error) {
      logger.error('Failed to execute custom query', { error: error.message, query });
      throw error;
    }
  }

  async getTableCount(tableName) {
    try {
      const query = `SELECT COUNT(*) as count FROM ${tableName}`;
      const result = await this.db.query(query);
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error('Failed to get table count', { error: error.message, tableName });
      throw error;
    }
  }

  // Close database connection
  async close() {
    await this.db.close();
  }
}

module.exports = new DatabaseService();
