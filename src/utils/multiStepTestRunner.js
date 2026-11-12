const BrowserManager = require('./browser');
const MultiStepRegisterPage = require('../pages/MultiStepRegisterPage');
const DatabaseService = require('../services/DatabaseService');
const RedisService = require('../services/RedisService');
const TestHelpers = require('./helpers');
const logger = require('./logger');

class MultiStepTestRunner {
  constructor(options = {}) {
    this.options = {
      // App configuration
      appUrl: options.appUrl || process.env.APP_URL || 'http://localhost:3000',
      headless: options.headless !== undefined ? options.headless : process.env.HEADLESS === 'true',
      screenshotOnFailure: options.screenshotOnFailure !== undefined ? options.screenshotOnFailure : true,
      timeout: options.timeout || parseInt(process.env.TEST_TIMEOUT) || 30000,
      
      // User data
      userData: options.userData || null,
      
      // Flow configuration
      captchaText: options.captchaText || null,         // Text để solve captcha
      otpCode: options.otpCode || null,                 // OTP code để verify
      waitForOtpEmail: options.waitForOtpEmail !== false, // Có đợi email OTP không
      waitForManualOtp: options.waitForManualOtp !== false, // Đợi tester nhập OTP manual trong browser
      waitForTerminalOtp: options.waitForTerminalOtp !== false, // Đợi tester nhập OTP qua terminal
      manualOtpTimeout: options.manualOtpTimeout || 300000, // 5 minutes default
      terminalOtpTimeout: options.terminalOtpTimeout || 300000, // 5 minutes default
      skipCaptcha: options.skipCaptcha || false,        // Skip captcha step
      
      // Timeouts cho từng bước
      validationTimeout: options.validationTimeout || 10000,
      otpEmailTimeout: options.otpEmailTimeout || 60000,
      captchaTimeout: options.captchaTimeout || 30000,
      
      // Database và Redis
      enableDatabase: options.enableDatabase !== undefined ? options.enableDatabase : true,
      enableRedis: options.enableRedis !== undefined ? options.enableRedis : true,
      cleanupAfterTest: options.cleanupAfterTest !== undefined ? options.cleanupAfterTest : true,
      
      // Validation
      validateInputs: options.validateInputs !== undefined ? options.validateInputs : true,
      
      ...options
    };
    
    this.browserManager = null;
    this.registerPage = null;
    this.testResults = {
      success: false,
      duration: 0,
      steps: [],
      screenshots: [],
      errors: [],
      userData: null
    };
  }

  // Khởi tạo
  async initialize() {
    try {
      logger.info('Initializing multi-step test runner', { options: this.options });
      
      this.browserManager = new BrowserManager();
      await this.browserManager.launchBrowser();
      await this.browserManager.createPage();
      
      this.registerPage = new MultiStepRegisterPage(this.browserManager);
      this.registerPage.pageUrl = `${this.options.appUrl}/register`;
      
      logger.info('Multi-step test runner initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize multi-step test runner', { error: error.message });
      throw error;
    }
  }

  // Tạo user data với fallback values
  generateUserData(customData = {}) {
    if (this.options.userData) {
      return { ...this.options.userData, ...customData };
    }
    
    const generatedData = TestHelpers.generateRegistrationData();
    
    return {
      email: customData.email || generatedData.email,
      firstName: customData.firstName || generatedData.firstName,
      lastName: customData.lastName || generatedData.lastName,
      phone: customData.phone || generatedData.phone.replace(/^0/, ''), // Remove leading 0 for international format
      countryCode: customData.countryCode || '+84', // Default Vietnam
      username: customData.username || `user_${TestHelpers.generateRandomString(8)}`,
      dateOfBirth: customData.dateOfBirth || TestHelpers.formatDateForInput(generatedData.dateOfBirth),
      address: customData.address || generatedData.address,
      city: customData.city || generatedData.city,
      postalCode: customData.postalCode || generatedData.postalCode,
      ...customData
    };
  }

  // Validate user data
  validateUserData(userData) {
    if (!this.options.validateInputs) {
      return { valid: true, errors: [] };
    }

    const errors = [];
    
    if (!userData.email || !TestHelpers.isValidEmail(userData.email)) {
      errors.push('Invalid email format');
    }
    
    // Password validation chỉ cần thiết khi có password field trong form
    if (userData.password) {
      const passwordValidation = TestHelpers.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        errors.push(`Weak password: missing ${Object.entries(passwordValidation.checks)
          .filter(([key, value]) => !value)
          .map(([key]) => key)
          .join(', ')}`);
      }
    }
    
    if (userData.phone && !TestHelpers.isValidVietnamesePhone('0' + userData.phone)) {
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

  // Chạy luồng đăng ký đầy đủ
  async runCompleteRegistrationFlow(customUserData = {}, flowOptions = {}) {
    const startTime = Date.now();
    
    try {
      logger.testStart('Multi-Step Registration Flow', { customUserData, flowOptions });
      
      // Step 1: Tạo user data
      const userData = this.generateUserData(customUserData);
      this.testResults.userData = userData;
      this.addStep('generate_user_data', true, 'User data generated successfully');
      
      logger.info('Generated user data', { 
        email: userData.email, 
        hasPassword: !!userData.password,
        hasPhone: !!userData.phone 
      });
      
      // Step 2: Validate data
      const validation = this.validateUserData(userData);
      if (!validation.valid) {
        this.addStep('validate_data', false, `Validation failed: ${validation.errors.join(', ')}`);
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      this.addStep('validate_data', true, 'Data validation passed');
      
      // Step 3: Chạy luồng đăng ký
      const registrationOptions = {
        captchaText: flowOptions.captchaText || this.options.captchaText,
        otpCode: flowOptions.otpCode || this.options.otpCode,
        waitForOtpEmail: flowOptions.waitForOtpEmail !== undefined ? flowOptions.waitForOtpEmail : this.options.waitForOtpEmail,
        skipCaptcha: flowOptions.skipCaptcha !== undefined ? flowOptions.skipCaptcha : this.options.skipCaptcha,
        ...flowOptions
      };
      
      const result = await this.registerPage.completeRegistrationFlow(userData, registrationOptions);
      
      if (result.success) {
        this.addStep('complete_registration', true, result.message || 'Registration completed successfully');
        this.testResults.success = true;
        
        // Step 4: Lưu vào database nếu cần
        if (this.options.enableDatabase) {
          try {
            await this.saveUserToDatabase(userData);
            this.addStep('save_to_database', true, 'User saved to database');
          } catch (dbError) {
            this.addStep('save_to_database', false, `Database error: ${dbError.message}`);
            logger.warn('Failed to save user to database', { error: dbError.message });
          }
        }
        
        // Step 5: Lưu session vào Redis nếu cần
        if (this.options.enableRedis) {
          try {
            await this.saveUserSession(userData);
            this.addStep('save_to_redis', true, 'Session saved to Redis');
          } catch (redisError) {
            this.addStep('save_to_redis', false, `Redis error: ${redisError.message}`);
            logger.warn('Failed to save user session', { error: redisError.message });
          }
        }
        
        logger.info('Multi-step registration completed successfully', { result });
        
      } else {
        this.addStep('complete_registration', false, result.message || result.error || 'Registration failed');
        this.testResults.success = false;
        this.testResults.errors.push(result.message || result.error || 'Registration failed');
        logger.error('Multi-step registration failed', { result });
      }
      
    } catch (error) {
      this.testResults.success = false;
      this.testResults.errors.push(error.message);
      this.addStep('registration_flow', false, error.message);
      logger.error('Multi-step registration error', { error: error.message });
      
      // Chụp screenshot khi có lỗi
      if (this.options.screenshotOnFailure) {
        try {
          const screenshotPath = await this.registerPage.takeScreenshot('multi_step_registration_error');
          this.testResults.screenshots.push(screenshotPath);
        } catch (screenshotError) {
          logger.warn('Failed to take error screenshot', { error: screenshotError.message });
        }
      }
      
      throw error;
    } finally {
      this.testResults.duration = Date.now() - startTime;
      logger.testEnd('Multi-Step Registration Flow', 
        this.testResults.success ? 'passed' : 'failed', 
        this.testResults.duration);
    }
    
    return this.testResults;
  }

  // Chạy từng bước riêng lẻ để debug
  async runStepByStep(userData, options = {}) {
    logger.testStart('Step-by-Step Registration');
    
    try {
      // Bước 1: Fill basic info
      logger.info('=== STEP 1: Fill Basic Information ===');
      await this.registerPage.navigate();
      await this.registerPage.fillBasicInformation(userData);
      await this.wait(2000); // Pause để xem
      
      // Bước 2: Click continue
      logger.info('=== STEP 2: Click Continue Button ===');
      await this.registerPage.clickContinueButton();
      await this.wait(2000);
      
      // Bước 3: Handle captcha
      if (!options.skipCaptcha) {
        logger.info('=== STEP 3: Handle Captcha ===');
        const captchaResult = await this.registerPage.handleCaptchaIfExists(options.captchaText);
        logger.info('Captcha result:', captchaResult);
        await this.wait(2000);
      }
      
      // Bước 4: Wait for validation
      logger.info('=== STEP 4: Wait for Validation ===');
      const validationResult = await this.registerPage.waitForValidationAndRedirect();
      logger.info('Validation result:', validationResult);
      await this.wait(2000);
      
      // Bước 5: Wait for OTP
      if (options.waitForOtpEmail !== false) {
        logger.info('=== STEP 5: Wait for OTP Email ===');
        const otpEmailResult = await this.registerPage.waitForOtpEmail();
        logger.info('OTP email result:', otpEmailResult);
        await this.wait(2000);
      }
      
      // Bước 6: Enter OTP
      if (options.otpCode) {
        logger.info('=== STEP 6: Enter OTP ===');
        await this.registerPage.enterOtpCode(options.otpCode);
        await this.wait(1000);
        
        logger.info('=== STEP 7: Verify OTP ===');
        const otpResult = await this.registerPage.verifyOtp();
        logger.info('OTP verification result:', otpResult);
        await this.wait(2000);
      }
      
      // Bước 7: Check success
      logger.info('=== STEP 8: Check Registration Success ===');
      const successResult = await this.registerPage.checkRegistrationSuccess();
      logger.info('Success check result:', successResult);
      
      return successResult;
      
    } catch (error) {
      logger.error('Step-by-step registration failed', { error: error.message });
      await this.registerPage.takeScreenshot('step_by_step_error');
      throw error;
    }
  }

  // Utility methods
  addStep(name, success, message) {
    this.testResults.steps.push({
      name,
      success,
      message,
      timestamp: new Date().toISOString()
    });
  }

  async wait(ms) {
    await TestHelpers.wait(ms);
  }

  async saveUserToDatabase(userData) {
    if (!this.options.enableDatabase) return;
    
    const dbUser = await DatabaseService.createUser({
      email: userData.email,
      passwordHash: 'hashed_' + userData.password,
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
  }

  async saveUserSession(userData) {
    if (!this.options.enableRedis) return;
    
    const sessionId = TestHelpers.generateTestId();
    const sessionData = {
      email: userData.email,
      loginTime: new Date().toISOString(),
      userAgent: 'multi-step-automation'
    };
    
    await RedisService.setSession(sessionId, sessionData, 3600);
    logger.info('User session saved to Redis', { sessionId, email: userData.email });
    return sessionId;
  }

  async cleanup() {
    try {
      if (this.options.cleanupAfterTest) {
        if (this.options.enableDatabase) {
          await DatabaseService.deleteTestUsers();
        }
        if (this.options.enableRedis) {
          await RedisService.clearTestData();
        }
      }
      
      if (this.browserManager) {
        await this.browserManager.closeBrowser();
      }
      
      logger.info('Multi-step test cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup multi-step test', { error: error.message });
    }
  }

  getResults() {
    return this.testResults;
  }
}

module.exports = MultiStepTestRunner;
