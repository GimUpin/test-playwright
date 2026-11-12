const redis = require('../config/redis');
const logger = require('../utils/logger');

class RedisService {
  constructor() {
    this.redis = redis;
  }

  // Test Redis connection
  async testConnection() {
    return await this.redis.testConnection();
  }

  // Initialize Redis connection
  async connect() {
    try {
      if (!this.redis.isConnected) {
        await this.redis.connect();
      }
      return true;
    } catch (error) {
      logger.error('Failed to connect to Redis', { error: error.message });
      throw error;
    }
  }

  // Session management
  async setSession(sessionId, sessionData, expireInSeconds = 3600) {
    try {
      await this.redis.set(`session:${sessionId}`, sessionData, expireInSeconds);
      logger.info('Session set successfully', { sessionId, expireInSeconds });
    } catch (error) {
      logger.error('Failed to set session', { error: error.message, sessionId });
      throw error;
    }
  }

  async getSession(sessionId) {
    try {
      const sessionData = await this.redis.get(`session:${sessionId}`);
      if (sessionData) {
        logger.info('Session retrieved successfully', { sessionId });
      } else {
        logger.info('Session not found', { sessionId });
      }
      return sessionData;
    } catch (error) {
      logger.error('Failed to get session', { error: error.message, sessionId });
      throw error;
    }
  }

  async deleteSession(sessionId) {
    try {
      await this.redis.del(`session:${sessionId}`);
      logger.info('Session deleted successfully', { sessionId });
    } catch (error) {
      logger.error('Failed to delete session', { error: error.message, sessionId });
      throw error;
    }
  }

  // OTP management
  async setOTP(email, otpCode, expireInSeconds = 300) {
    try {
      await this.redis.set(`otp:${email}`, otpCode, expireInSeconds);
      logger.info('OTP set successfully', { email, expireInSeconds });
    } catch (error) {
      logger.error('Failed to set OTP', { error: error.message, email });
      throw error;
    }
  }

  async getOTP(email) {
    try {
      const otpCode = await this.redis.get(`otp:${email}`);
      if (otpCode) {
        logger.info('OTP retrieved successfully', { email });
      } else {
        logger.info('OTP not found or expired', { email });
      }
      return otpCode;
    } catch (error) {
      logger.error('Failed to get OTP', { error: error.message, email });
      throw error;
    }
  }

  async deleteOTP(email) {
    try {
      await this.redis.del(`otp:${email}`);
      logger.info('OTP deleted successfully', { email });
    } catch (error) {
      logger.error('Failed to delete OTP', { error: error.message, email });
      throw error;
    }
  }

  // Rate limiting
  async setRateLimit(identifier, limit, windowInSeconds = 3600) {
    try {
      const key = `rate_limit:${identifier}`;
      const current = await this.redis.get(key) || 0;
      
      if (current >= limit) {
        logger.warn('Rate limit exceeded', { identifier, current, limit });
        return false;
      }
      
      await this.redis.set(key, current + 1, windowInSeconds);
      logger.info('Rate limit updated', { identifier, current: current + 1, limit });
      return true;
    } catch (error) {
      logger.error('Failed to check rate limit', { error: error.message, identifier });
      throw error;
    }
  }

  async getRateLimit(identifier) {
    try {
      const current = await this.redis.get(`rate_limit:${identifier}`) || 0;
      return parseInt(current);
    } catch (error) {
      logger.error('Failed to get rate limit', { error: error.message, identifier });
      throw error;
    }
  }

  async resetRateLimit(identifier) {
    try {
      await this.redis.del(`rate_limit:${identifier}`);
      logger.info('Rate limit reset', { identifier });
    } catch (error) {
      logger.error('Failed to reset rate limit', { error: error.message, identifier });
      throw error;
    }
  }

  // Cache management
  async setCache(key, data, expireInSeconds = 3600) {
    try {
      await this.redis.set(`cache:${key}`, data, expireInSeconds);
      logger.info('Cache set successfully', { key, expireInSeconds });
    } catch (error) {
      logger.error('Failed to set cache', { error: error.message, key });
      throw error;
    }
  }

  async getCache(key) {
    try {
      const data = await this.redis.get(`cache:${key}`);
      if (data) {
        logger.info('Cache hit', { key });
      } else {
        logger.info('Cache miss', { key });
      }
      return data;
    } catch (error) {
      logger.error('Failed to get cache', { error: error.message, key });
      throw error;
    }
  }

  async deleteCache(key) {
    try {
      await this.redis.del(`cache:${key}`);
      logger.info('Cache deleted successfully', { key });
    } catch (error) {
      logger.error('Failed to delete cache', { error: error.message, key });
      throw error;
    }
  }

  // Test data cleanup
  async clearTestData() {
    try {
      // Clear test sessions
      await this.clearKeysByPattern('session:test_*');
      
      // Clear test OTPs
      await this.clearKeysByPattern('otp:test*');
      
      // Clear test cache
      await this.clearKeysByPattern('cache:test_*');
      
      // Clear test rate limits
      await this.clearKeysByPattern('rate_limit:test_*');
      
      logger.info('Test data cleared from Redis');
    } catch (error) {
      logger.error('Failed to clear test data', { error: error.message });
      throw error;
    }
  }

  async clearKeysByPattern(pattern) {
    try {
      // Note: In production, consider using SCAN instead of KEYS for better performance
      const keys = await this.redis.client.keys(pattern);
      if (keys.length > 0) {
        await this.redis.client.del(keys);
        logger.info('Keys deleted by pattern', { pattern, count: keys.length });
      }
    } catch (error) {
      logger.error('Failed to clear keys by pattern', { error: error.message, pattern });
      throw error;
    }
  }

  // Email verification tokens
  async setEmailVerificationToken(email, token, expireInSeconds = 3600) {
    try {
      await this.redis.set(`email_verification:${email}`, token, expireInSeconds);
      logger.info('Email verification token set', { email, expireInSeconds });
    } catch (error) {
      logger.error('Failed to set email verification token', { error: error.message, email });
      throw error;
    }
  }

  async getEmailVerificationToken(email) {
    try {
      const token = await this.redis.get(`email_verification:${email}`);
      if (token) {
        logger.info('Email verification token retrieved', { email });
      } else {
        logger.info('Email verification token not found', { email });
      }
      return token;
    } catch (error) {
      logger.error('Failed to get email verification token', { error: error.message, email });
      throw error;
    }
  }

  async deleteEmailVerificationToken(email) {
    try {
      await this.redis.del(`email_verification:${email}`);
      logger.info('Email verification token deleted', { email });
    } catch (error) {
      logger.error('Failed to delete email verification token', { error: error.message, email });
      throw error;
    }
  }

  // Utility methods
  async exists(key) {
    try {
      return await this.redis.exists(key);
    } catch (error) {
      logger.error('Failed to check key existence', { error: error.message, key });
      throw error;
    }
  }

  async set(key, value, expireInSeconds = null) {
    try {
      return await this.redis.set(key, value, expireInSeconds);
    } catch (error) {
      logger.error('Failed to set key', { error: error.message, key });
      throw error;
    }
  }

  async get(key) {
    try {
      return await this.redis.get(key);
    } catch (error) {
      logger.error('Failed to get key', { error: error.message, key });
      throw error;
    }
  }

  async del(key) {
    try {
      return await this.redis.del(key);
    } catch (error) {
      logger.error('Failed to delete key', { error: error.message, key });
      throw error;
    }
  }

  // Close Redis connection
  async disconnect() {
    await this.redis.disconnect();
  }
}

module.exports = new RedisService();
