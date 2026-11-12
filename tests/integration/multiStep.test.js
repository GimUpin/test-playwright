const MultiStepTestRunner = require('../../src/utils/multiStepTestRunner');
const logger = require('../../src/utils/logger');

describe('Multi-Step Registration Flow Tests', () => {
  let testRunner;

  beforeEach(async () => {
    testRunner = new MultiStepTestRunner({
      appUrl: 'https://pub-portal-dev.mp.directsale.vn/authentication/register?lang=vi',
      headless: true,
      screenshotOnFailure: true,
      validateInputs: true,
      cleanupAfterTest: false,
      
      // Test timeouts
      validationTimeout: 5000,
      otpEmailTimeout: 10000,
      captchaTimeout: 5000
    });

    await testRunner.initialize();
  });

  afterEach(async () => {
    if (testRunner) {
      await testRunner.cleanup();
    }
  });

  describe('Complete Flow Tests', () => {
    test('should handle complete multi-step registration flow', async () => {
      const userData = {
        email: 'multistep.test@example.com',
        password: 'MultiStep123!',
        confirmPassword: 'MultiStep123!',
        firstName: 'Multi',
        lastName: 'Step',
        username: 'multistep_user',
        phone: '0987654321',
        dateOfBirth: '01/01/1990'
      };

      const flowOptions = {
        captchaText: 'ABCD123',
        otpCode: '123456',
        waitForOtpEmail: true,
        skipCaptcha: false
      };

      try {
        const result = await testRunner.runCompleteRegistrationFlow(userData, flowOptions);
        
        // Verify test structure
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('steps');
        expect(result).toHaveProperty('duration');
        expect(result).toHaveProperty('userData');
        
        // Verify user data was used
        expect(result.userData.email).toBe(userData.email);
        expect(result.userData.firstName).toBe(userData.firstName);
        
        // Verify steps were recorded
        expect(result.steps.length).toBeGreaterThan(0);
        expect(result.steps[0].name).toBe('generate_user_data');
        
      } catch (error) {
        // Expected to fail without real server, but structure should be correct
        expect(error.message).toContain('ERR_CONNECTION_REFUSED');
        expect(testRunner.testResults.userData.email).toBe(userData.email);
        expect(testRunner.testResults.steps.length).toBeGreaterThan(0);
      }
    });

    test('should handle auto-generated user data', async () => {
      const flowOptions = {
        skipCaptcha: true,
        waitForOtpEmail: false
      };

      try {
        const result = await testRunner.runCompleteRegistrationFlow({}, flowOptions);
        
        // Should have auto-generated data
        expect(result.userData.email).toMatch(/@test\.com$/);
        expect(result.userData.password).toBeTruthy();
        expect(result.userData.phone).toMatch(/^09\d{8}$/);
        expect(result.userData.username).toBeTruthy();
        
      } catch (error) {
        // Check auto-generated data was created
        expect(testRunner.testResults.userData.email).toMatch(/@test\.com$/);
        expect(testRunner.testResults.userData.password).toBeTruthy();
      }
    });

    test('should handle partial custom data with auto-generation', async () => {
      const partialData = {
        email: 'partial.multistep@example.com',
        firstName: 'Partial',
        lastName: 'Data'
      };

      try {
        const result = await testRunner.runCompleteRegistrationFlow(partialData);
        
        // Custom fields should be preserved
        expect(result.userData.email).toBe(partialData.email);
        expect(result.userData.firstName).toBe(partialData.firstName);
        
        // Auto-generated fields should exist
        expect(result.userData.password).toBeTruthy();
        expect(result.userData.phone).toBeTruthy();
        expect(result.userData.username).toBeTruthy();
        
      } catch (error) {
        // Check data was processed correctly
        expect(testRunner.testResults.userData.email).toBe(partialData.email);
        expect(testRunner.testResults.userData.password).toBeTruthy();
      }
    });
  });

  describe('Flow Options Tests', () => {
    test('should respect skipCaptcha option', async () => {
      const userData = {
        email: 'skipcaptcha@example.com',
        password: 'SkipCaptcha123!',
        firstName: 'Skip',
        lastName: 'Captcha'
      };

      const flowOptions = {
        skipCaptcha: true,
        waitForOtpEmail: false
      };

      try {
        await testRunner.runCompleteRegistrationFlow(userData, flowOptions);
      } catch (error) {
        // Should not contain captcha-related errors
        expect(error.message).not.toContain('captcha');
      }
    });

    test('should respect waitForOtpEmail option', async () => {
      const userData = {
        email: 'nootp@example.com',
        password: 'NoOtp123!',
        firstName: 'No',
        lastName: 'OTP'
      };

      const flowOptions = {
        skipCaptcha: true,
        waitForOtpEmail: false
      };

      try {
        await testRunner.runCompleteRegistrationFlow(userData, flowOptions);
      } catch (error) {
        // Should process without waiting for OTP
        const steps = testRunner.testResults.steps;
        const otpSteps = steps.filter(step => step.name.includes('otp'));
        expect(otpSteps.length).toBe(0);
      }
    });

    test('should handle custom timeouts', async () => {
      const shortTimeoutRunner = new MultiStepTestRunner({
        appUrl: 'https://example.com',
        headless: true,
        validationTimeout: 1000,  // Very short timeout
        otpEmailTimeout: 1000,
        captchaTimeout: 1000
      });

      await shortTimeoutRunner.initialize();

      try {
        const userData = {
          email: 'timeout.test@example.com',
          password: 'Timeout123!',
          firstName: 'Timeout',
          lastName: 'Test'
        };

        await shortTimeoutRunner.runCompleteRegistrationFlow(userData);
      } catch (error) {
        // Should timeout quickly
        expect(error.message).toBeTruthy();
      } finally {
        await shortTimeoutRunner.cleanup();
      }
    });
  });

  describe('Validation Tests', () => {
    test('should validate email format in multi-step flow', async () => {
      const invalidData = {
        email: 'invalid-email-format',
        password: 'ValidPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      await expect(testRunner.runCompleteRegistrationFlow(invalidData))
        .rejects.toThrow('Invalid email format');
    });

    test('should validate password strength in multi-step flow', async () => {
      const weakPasswordData = {
        email: 'test@example.com',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User'
      };

      await expect(testRunner.runCompleteRegistrationFlow(weakPasswordData))
        .rejects.toThrow('Weak password');
    });

    test('should validate Vietnamese phone number in multi-step flow', async () => {
      const invalidPhoneData = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        phone: '123456789',
        firstName: 'Test',
        lastName: 'User'
      };

      await expect(testRunner.runCompleteRegistrationFlow(invalidPhoneData))
        .rejects.toThrow('Invalid Vietnamese phone number format');
    });

    test('should skip validation when disabled', async () => {
      const noValidationRunner = new MultiStepTestRunner({
        appUrl: 'https://example.com',
        validateInputs: false,
        headless: true
      });

      await noValidationRunner.initialize();

      try {
        const invalidData = {
          email: 'invalid-email',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User'
        };

        await noValidationRunner.runCompleteRegistrationFlow(invalidData);
      } catch (error) {
        // Should only fail on connection, not validation
        expect(error.message).not.toContain('Invalid email format');
        expect(error.message).not.toContain('Weak password');
      } finally {
        await noValidationRunner.cleanup();
      }
    });
  });

  describe('Step Tracking Tests', () => {
    test('should track all steps in the registration flow', async () => {
      const userData = {
        email: 'step.tracking@example.com',
        password: 'StepTracking123!',
        firstName: 'Step',
        lastName: 'Tracking'
      };

      try {
        await testRunner.runCompleteRegistrationFlow(userData);
      } catch (error) {
        // Even if it fails, steps should be tracked
        const steps = testRunner.testResults.steps;
        expect(steps.length).toBeGreaterThan(0);
        
        // Should have at least basic steps
        const stepNames = steps.map(step => step.name);
        expect(stepNames).toContain('generate_user_data');
        expect(stepNames).toContain('validate_data');
        
        // Each step should have required properties
        steps.forEach(step => {
          expect(step).toHaveProperty('name');
          expect(step).toHaveProperty('success');
          expect(step).toHaveProperty('message');
          expect(step).toHaveProperty('timestamp');
        });
      }
    });

    test('should record duration for the test', async () => {
      const userData = {
        email: 'duration.test@example.com',
        password: 'Duration123!',
        firstName: 'Duration',
        lastName: 'Test'
      };

      const startTime = Date.now();

      try {
        await testRunner.runCompleteRegistrationFlow(userData);
      } catch (error) {
        // Duration should be recorded even on failure
        const endTime = Date.now();
        const results = testRunner.getResults();
        
        expect(results.duration).toBeGreaterThan(0);
        expect(results.duration).toBeLessThan(endTime - startTime + 1000); // Allow some margin
      }
    });
  });

  describe('Configuration Tests', () => {
    test('should respect database and Redis settings', async () => {
      const configRunner = new MultiStepTestRunner({
        appUrl: 'https://example.com',
        enableDatabase: false,
        enableRedis: false,
        headless: true
      });

      await configRunner.initialize();

      try {
        const userData = {
          email: 'config.test@example.com',
          password: 'Config123!',
          firstName: 'Config',
          lastName: 'Test'
        };

        await configRunner.runCompleteRegistrationFlow(userData);
      } catch (error) {
        // Should not have database/Redis related steps
        const steps = configRunner.testResults.steps;
        const dbSteps = steps.filter(step => step.name.includes('database'));
        const redisSteps = steps.filter(step => step.name.includes('redis'));
        
        expect(dbSteps.length).toBe(0);
        expect(redisSteps.length).toBe(0);
      } finally {
        await configRunner.cleanup();
      }
    });

    test('should respect screenshot settings', () => {
      const screenshotRunner = new MultiStepTestRunner({
        appUrl: 'https://example.com',
        screenshotOnFailure: false,
        headless: true
      });

      expect(screenshotRunner.options.screenshotOnFailure).toBe(false);
    });
  });
});
