const redis = require('redis');
require('dotenv').config();

class RedisConfig {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('The server refused the connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('connect', () => {
        console.log('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        console.log('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('Redis connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  async set(key, value, expireInSeconds = null) {
    if (!this.isConnected) {
      throw new Error('Redis client not connected');
    }
    
    if (expireInSeconds) {
      return await this.client.setEx(key, expireInSeconds, JSON.stringify(value));
    }
    return await this.client.set(key, JSON.stringify(value));
  }

  async get(key) {
    if (!this.isConnected) {
      throw new Error('Redis client not connected');
    }
    
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key) {
    if (!this.isConnected) {
      throw new Error('Redis client not connected');
    }
    
    return await this.client.del(key);
  }

  async exists(key) {
    if (!this.isConnected) {
      throw new Error('Redis client not connected');
    }
    
    return await this.client.exists(key);
  }

  // Test Redis connection
  async testConnection() {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      await this.client.ping();
      console.log('Redis connection successful');
      return true;
    } catch (error) {
      console.error('Redis connection failed:', error);
      return false;
    }
  }
}

module.exports = new RedisConfig();
