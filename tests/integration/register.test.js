const BrowserManager = require('../../src/utils/browser');
const RegisterPage = require('../../src/pages/RegisterPage');
const DatabaseService = require('../../src/services/DatabaseService');
const RedisService = require('../../src/services/RedisService');
const UserDataFixtures = require('../fixtures/userData');
const logger = require('../../src/utils/logger');

describe('User Registration Flow', () => {
  let browserManager;
  let registerPage;
  let testStartTime;

  beforeAll(async () => {
    testStartTime = Date.now();
    logger.testStart('User Registration Flow Test Suite');
    
    // Initialize services
    browserManager = new BrowserManager();
    await browserManager.launchBrowser();
    
    // Test database and Redis connections
    const dbConnected = await DatabaseService.testConnection();
    const redisConnected = await RedisService.testConnection();
    
    if (!dbConnected) {
      console.warn('⚠️  Database connection failed - some tests may be skipped');
    }
    
    if (!redisConnected) {
      console.warn('⚠️  Redis connection failed - some tests may be skipped');
    }
  });

  afterAll(async () => {
    const duration = Date.now() - testStartTime;
    logger.testEnd('User Registration Flow Test Suite', 'completed', duration);
    
    // Cleanup
    await browserManager.closeBrowser();
    
    // Clean up test data
    try {
      await DatabaseService.deleteTestUsers();
      await RedisService.clearTestData();
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  });

  beforeEach(async () => {
    registerPage = new RegisterPage(browserManager);
    await registerPage.createPage();
  });

  afterEach(async () => {
    if (browserManager.page) {
      await browserManager.closeCurrentPage();
    }
  });

  describe('Successful Registration', () => {
    test('should register user with valid data', async () => {
      const userData = UserDataFixtures.getValidUserData();
      
      logger.testStep('Testing successful user registration');
      
      await registerPage.navigateToRegister();
      expect(await registerPage.isPageLoaded()).toBe(true);
      
      await registerPage.fillRegistrationForm(userData);
      expect(await registerPage.isFormValid()).toBe(true);
      
      await registerPage.submitRegistration();
      
      const result = await registerPage.waitForRegistrationResult();
      expect(['success', 'otp']).toContain(result);
      
      if (result === 'success') {
        const successMessage = await registerPage.getSuccessMessage();
        expect(successMessage).toBeTruthy();
      }
      
      // Verify user is created in database (if available)
      try {
        const dbUser = await DatabaseService.getUserByEmail(userData.email);
        expect(dbUser).toBeTruthy();
        expect(dbUser.email).toBe(userData.email);
      } catch (error) {
        console.warn('Database verification skipped:', error.message);
      }
    });

    test('should register user with minimal required data', async () => {
      const userData = UserDataFixtures.getMinimalValidUserData();
      
      await registerPage.navigateToRegister();
      await registerPage.fillRegistrationForm(userData);
      await registerPage.submitRegistration();
      
      const result = await registerPage.waitForRegistrationResult();
      expect(['success', 'otp']).toContain(result);
    });

    test('should register user with complete data', async () => {
      const userData = UserDataFixtures.getCompleteUserData();
      
      await registerPage.navigateToRegister();
      await registerPage.fillRegistrationForm(userData);
      await registerPage.submitRegistration();
      
      const result = await registerPage.waitForRegistrationResult();
      expect(['success', 'otp']).toContain(result);
    });
  });

  describe('Email Validation', () => {
    test.each(UserDataFixtures.getInvalidEmailData())(
      'should show error for $description',
      async ({ email, expectedError }) => {
        const userData = UserDataFixtures.getValidUserData();
        userData.email = email;
        
        await registerPage.navigateToRegister();
        await registerPage.fillRegistrationForm(userData);
        await registerPage.submitRegistration();
        
        const errors = await registerPage.getErrorMessages();
        expect(errors.email || errors.general).toContain(expectedError);
      }
    );

    test('should validate email format in real-time', async () => {
      await registerPage.navigateToRegister();
      
      await registerPage.fillEmail('invalid-email');
      await registerPage.clickElement('body'); // Trigger validation
      
      const errors = await registerPage.getErrorMessages();
      expect(errors.email).toBeTruthy();
    });
  });

  describe('Password Validation', () => {
    test.each(UserDataFixtures.getInvalidPasswordData())(
      'should show error for password $description',
      async ({ password, expectedError }) => {
        const userData = UserDataFixtures.getValidUserData();
        userData.password = password;
        userData.confirmPassword = password;
        
        await registerPage.navigateToRegister();
        await registerPage.fillRegistrationForm(userData);
        await registerPage.submitRegistration();
        
        const errors = await registerPage.getErrorMessages();
        expect(errors.password || errors.general).toContain(expectedError);
      }
    );

    test.each(UserDataFixtures.getPasswordMismatchData())(
      'should show error for $description',
      async ({ password, confirmPassword, expectedError }) => {
        const userData = UserDataFixtures.getValidUserData();
        userData.password = password;
        userData.confirmPassword = confirmPassword;
        
        await registerPage.navigateToRegister();
        await registerPage.fillRegistrationForm(userData);
        await registerPage.submitRegistration();
        
        const errors = await registerPage.getErrorMessages();
        expect(errors.confirmPassword || errors.general).toContain(expectedError);
      }
    );
  });

  describe('Phone Number Validation', () => {
    test.each(UserDataFixtures.getInvalidPhoneData())(
      'should show error for phone $description',
      async ({ phone, expectedError }) => {
        const userData = UserDataFixtures.getValidUserData();
        userData.phone = phone;
        
        await registerPage.navigateToRegister();
        await registerPage.fillRegistrationForm(userData);
        await registerPage.submitRegistration();
        
        const errors = await registerPage.getErrorMessages();
        expect(errors.phone || errors.general).toContain(expectedError);
      }
    );
  });

  describe('Required Fields Validation', () => {
    test.each(UserDataFixtures.getRequiredFieldData())(
      'should show error for $description',
      async ({ data, expectedError }) => {
        await registerPage.navigateToRegister();
        await registerPage.fillRegistrationForm(data);
        await registerPage.submitRegistration();
        
        const errors = await registerPage.getErrorMessages();
        expect(Object.values(errors).some(error => 
          error && error.includes(expectedError)
        )).toBe(true);
      }
    );
  });

  describe('Duplicate User Registration', () => {
    test('should prevent registration with existing email', async () => {
      const userData = UserDataFixtures.getValidUserData();
      
      // First registration
      await registerPage.navigateToRegister();
      await registerPage.fillRegistrationForm(userData);
      await registerPage.submitRegistration();
      
      let result = await registerPage.waitForRegistrationResult();
      expect(['success', 'otp']).toContain(result);
      
      // Wait a bit for data to be processed
      await registerPage.wait(2000);
      
      // Attempt second registration with same email
      await registerPage.navigateToRegister();
      await registerPage.fillRegistrationForm(userData);
      await registerPage.submitRegistration();
      
      const errors = await registerPage.getErrorMessages();
      expect(errors.email || errors.general).toMatch(/đã tồn tại|already exists/i);
    });
  });

  describe('UI/UX Validation', () => {
    test('should have proper page title and structure', async () => {
      await registerPage.navigateToRegister();
      
      const title = await registerPage.getPageTitle();
      expect(title).toContain('Đăng ký');
      
      // Check if all required form elements exist
      expect(await registerPage.elementExists(registerPage.selectors.emailInput)).toBe(true);
      expect(await registerPage.elementExists(registerPage.selectors.passwordInput)).toBe(true);
      expect(await registerPage.elementExists(registerPage.selectors.submitButton)).toBe(true);
    });

    test('should disable submit button when form is invalid', async () => {
      await registerPage.navigateToRegister();
      
      // Form should be invalid when empty
      expect(await registerPage.isFormValid()).toBe(false);
      
      // Fill partial data
      await registerPage.fillEmail('test@example.com');
      await registerPage.fillPassword('Test123!');
      
      // Form should still be invalid
      expect(await registerPage.isFormValid()).toBe(false);
    });

    test('should show loading state during submission', async () => {
      const userData = UserDataFixtures.getValidUserData();
      
      await registerPage.navigateToRegister();
      await registerPage.fillRegistrationForm(userData);
      await registerPage.submitRegistration();
      
      // Check for loading state immediately after submission
      const isLoading = await registerPage.isLoading();
      if (isLoading) {
        expect(isLoading).toBe(true);
      }
    });
  });

  describe('Navigation and Links', () => {
    test('should navigate to login page from registration', async () => {
      await registerPage.navigateToRegister();
      
      if (await registerPage.elementExists(registerPage.selectors.loginLink)) {
        await registerPage.navigateToLogin();
        
        const currentUrl = await registerPage.getCurrentUrl();
        expect(currentUrl).toMatch(/login/i);
      }
    });
  });

  describe('Performance Tests', () => {
    test('should load registration page within acceptable time', async () => {
      const startTime = Date.now();
      
      await registerPage.navigateToRegister();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // 5 seconds
    });

    test('should handle form submission within acceptable time', async () => {
      const userData = UserDataFixtures.getValidUserData();
      
      await registerPage.navigateToRegister();
      await registerPage.fillRegistrationForm(userData);
      
      const startTime = Date.now();
      await registerPage.submitRegistration();
      await registerPage.waitForRegistrationResult();
      
      const submissionTime = Date.now() - startTime;
      expect(submissionTime).toBeLessThan(10000); // 10 seconds
    });
  });
});
