const BrowserManager = require('./browser');
const RegisterPage = require('../pages/RegisterPage');
const DatabaseService = require('../services/DatabaseService');
const RedisService = require('../services/RedisService');
const TestHelpers = require('./helpers');
const logger = require('./logger');

class TestRunner {
  constructor(options = {}) {
    this.options = {
      // Default values - sẽ được override bởi tham số truyền vào
      appUrl: options.appUrl || process.env.APP_URL || 'http://localhost:3000',
      headless: options.headless !== undefined ? options.headless : process.env.HEADLESS === 'true',
      screenshotOnFailure: options.screenshotOnFailure !== undefined ? options.screenshotOnFailure : true,
      timeout: options.timeout || parseInt(process.env.TEST_TIMEOUT) || 30000,
      
      // User data có thể được truyền vào hoặc tự generate
      userData: options.userData || null,
      
      // Database và Redis options
      enableDatabase: options.enableDatabase !== undefined ? options.enableDatabase : true,
      enableRedis: options.enableRedis !== undefined ? options.enableRedis : true,
      
      // Test options
      cleanupAfterTest: options.cleanupAfterTest !== undefined ? options.cleanupAfterTest : true,
      validateInputs: options.validateInputs !== undefined ? options.validateInputs : true,
      
      ...options
    };
    
    this.browserManager = null;
    this.registerPage = null;
    this.testResults = {
      success: false,
      duration: 0,
      screenshots: [],
      errors: [],
      logs: []
    };
  }

  // Khởi tạo browser và page
  async initialize() {
    try {
      logger.info('Initializing test runner', { options: this.options });
      
      this.browserManager = new BrowserManager();
      await this.browserManager.launchBrowser();
      await this.browserManager.createPage();
      
      this.registerPage = new RegisterPage(this.browserManager);
      this.registerPage.pageUrl = `${this.options.appUrl}/register`;
      
      logger.info('Test runner initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize test runner', { error: error.message });
      throw error;
    }
  }

  // Tạo hoặc sử dụng user data được truyền vào
  generateUserData(customData = {}) {
    // Nếu có userData được truyền vào, sử dụng nó
    if (this.options.userData) {
      return { ...this.options.userData, ...customData };
    }
    
    // Nếu không, tự generate
    const generatedData = TestHelpers.generateRegistrationData();
    
    // Merge với custom data nếu có
    return {
      email: customData.email || generatedData.email,
      password: customData.password || generatedData.password,
      confirmPassword: customData.confirmPassword || customData.password || generatedData.password,
      firstName: customData.firstName || generatedData.firstName,
      lastName: customData.lastName || generatedData.lastName,
      username: customData.username || `user_${TestHelpers.generateRandomString(8)}`,
      phone: customData.phone || generatedData.phone,
      dateOfBirth: customData.dateOfBirth || TestHelpers.formatDateForInput(generatedData.dateOfBirth),
      address: customData.address || generatedData.address,
      city: customData.city || generatedData.city,
      postalCode: customData.postalCode || generatedData.postalCode,
      ...customData // Cho phép override bất kỳ field nào
    };
  }

  // Validate user data trước khi test
  validateUserData(userData) {
    if (!this.options.validateInputs) {
      return { valid: true, errors: [] };
    }

    const errors = [];
    
    if (!userData.email || !TestHelpers.isValidEmail(userData.email)) {
      errors.push('Invalid email format');
    }
    
    if (!userData.password) {
      errors.push('Password is required');
    } else {
      const passwordValidation = TestHelpers.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        errors.push(`Weak password: ${Object.entries(passwordValidation.checks)
          .filter(([key, value]) => !value)
          .map(([key]) => key)
          .join(', ')}`);
      }
    }
    
    if (userData.phone && !TestHelpers.isValidVietnamesePhone(userData.phone)) {
      errors.push('Invalid Vietnamese phone number format');
    }
    
    if (userData.confirmPassword && userData.password !== userData.confirmPassword) {
      errors.push('Password confirmation does not match');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Chạy test đăng ký với custom parameters
  async runRegistrationTest(customUserData = {}) {
    const startTime = Date.now();
    
    try {
      logger.testStart('Registration Test', { customUserData });
      
      // Tạo user data
      const userData = this.generateUserData(customUserData);
      logger.info('Generated user data', { 
        email: userData.email, 
        hasPassword: !!userData.password,
        hasPhone: !!userData.phone 
      });
      
      // Validate nếu cần
      const validation = this.validateUserData(userData);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Navigate đến trang đăng ký
      await this.registerPage.navigateToRegister();
      
      // Fill form
      await this.registerPage.fillRegistrationForm(userData);
      
      // Submit form
      await this.registerPage.submitRegistration();
      
      // Đợi kết quả
      const result = await this.registerPage.waitForRegistrationResult();
      
      this.testResults.success = ['success', 'otp'].includes(result);
      this.testResults.result = result;
      this.testResults.userData = userData;
      
      if (this.testResults.success) {
        logger.info('Registration test completed successfully', { result });
        
        // Lưu user vào database nếu cần
        if (this.options.enableDatabase && result === 'success') {
          try {
            await this.saveUserToDatabase(userData);
          } catch (dbError) {
            logger.warn('Failed to save user to database', { error: dbError.message });
          }
        }
        
        // Lưu session vào Redis nếu cần
        if (this.options.enableRedis) {
          try {
            await this.saveUserSession(userData);
          } catch (redisError) {
            logger.warn('Failed to save user session', { error: redisError.message });
          }
        }
      } else {
        const errors = await this.registerPage.getErrorMessages();
        this.testResults.errors = errors;
        logger.error('Registration test failed', { result, errors });
      }
      
    } catch (error) {
      this.testResults.success = false;
      this.testResults.errors.push(error.message);
      logger.error('Registration test error', { error: error.message });
      
      // Chụp screenshot khi có lỗi
      if (this.options.screenshotOnFailure) {
        try {
          const screenshotPath = await this.registerPage.takeScreenshot('registration_error');
          this.testResults.screenshots.push(screenshotPath);
        } catch (screenshotError) {
          logger.warn('Failed to take error screenshot', { error: screenshotError.message });
        }
      }
      
      throw error;
    } finally {
      this.testResults.duration = Date.now() - startTime;
      logger.testEnd('Registration Test', this.testResults.success ? 'passed' : 'failed', this.testResults.duration);
    }
    
    return this.testResults;
  }

  // Lưu user vào database
  async saveUserToDatabase(userData) {
    if (!this.options.enableDatabase) return;
    
    try {
      const dbUser = await DatabaseService.createUser({
        email: userData.email,
        passwordHash: 'hashed_' + userData.password, // Trong thực tế sẽ hash thật
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth,
        address: userData.address,
        city: userData.city,
        postalCode: userData.postalCode
      });
      
      logger.info('User saved to database', { userId: dbUser.id, email: userData.email });
      return dbUser;
    } catch (error) {
      logger.error('Failed to save user to database', { error: error.message });
      throw error;
    }
  }

  // Lưu session vào Redis
  async saveUserSession(userData) {
    if (!this.options.enableRedis) return;
    
    try {
      const sessionId = TestHelpers.generateTestId();
      const sessionData = {
        email: userData.email,
        loginTime: new Date().toISOString(),
        userAgent: 'test-automation'
      };
      
      await RedisService.setSession(sessionId, sessionData, 3600); // 1 hour
      logger.info('User session saved to Redis', { sessionId, email: userData.email });
      return sessionId;
    } catch (error) {
      logger.error('Failed to save user session', { error: error.message });
      throw error;
    }
  }

  // Cleanup sau khi test
  async cleanup() {
    try {
      if (this.options.cleanupAfterTest) {
        // Cleanup test data from database
        if (this.options.enableDatabase) {
          await DatabaseService.deleteTestUsers();
        }
        
        // Cleanup test data from Redis
        if (this.options.enableRedis) {
          await RedisService.clearTestData();
        }
      }
      
      // Close browser
      if (this.browserManager) {
        await this.browserManager.closeBrowser();
      }
      
      logger.info('Test cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup test', { error: error.message });
    }
  }

  // Test với multiple users
  async runBulkRegistrationTest(userDataArray) {
    const results = [];
    
    for (let i = 0; i < userDataArray.length; i++) {
      const userData = userDataArray[i];
      logger.info(`Running registration test ${i + 1}/${userDataArray.length}`, { email: userData.email });
      
      try {
        // Reinitialize cho mỗi test
        await this.browserManager.createPage();
        
        const result = await this.runRegistrationTest(userData);
        results.push({ index: i, success: true, result });
        
        await this.browserManager.closeCurrentPage();
      } catch (error) {
        results.push({ index: i, success: false, error: error.message, userData });
        logger.error(`Registration test ${i + 1} failed`, { error: error.message });
      }
      
      // Delay giữa các test để tránh rate limiting
      if (i < userDataArray.length - 1) {
        await TestHelpers.wait(1000);
      }
    }
    
    return results;
  }

  // Getter cho test results
  getResults() {
    return this.testResults;
  }
}

module.exports = TestRunner;
