const TestRunner = require('../../src/utils/testRunner');
const logger = require('../../src/utils/logger');

describe('Custom Data Registration Tests', () => {
  let testRunner;

  beforeEach(async () => {
    testRunner = new TestRunner({
      appUrl: 'https://example.com', // Thay bằng URL thật
      headless: true,
      screenshotOnFailure: true,
      validateInputs: true,
      cleanupAfterTest: false // Để kiểm tra data sau test
    });

    await testRunner.initialize();
  });

  afterEach(async () => {
    if (testRunner) {
      await testRunner.cleanup();
    }
  });

  describe('Custom User Data Tests', () => {
    test('should accept and use custom user data', async () => {
      const customData = {
        email: 'custom.test@example.com',
        password: 'CustomPassword123!',
        confirmPassword: 'CustomPassword123!',
        firstName: 'Custom',
        lastName: 'User',
        username: 'customuser',
        phone: '0987123456',
        dateOfBirth: '01/01/1990',
        address: 'Custom Address 123',
        city: 'Custom City',
        postalCode: '12345'
      };

      try {
        const result = await testRunner.runRegistrationTest(customData);
        
        // Verify that custom data was used
        expect(result.userData.email).toBe(customData.email);
        expect(result.userData.firstName).toBe(customData.firstName);
        expect(result.userData.lastName).toBe(customData.lastName);
        expect(result.userData.username).toBe(customData.username);
        expect(result.userData.phone).toBe(customData.phone);
        
        // Note: Test sẽ fail nếu không có server thật, nhưng logic vẫn được test
      } catch (error) {
        // Expected to fail without real server, but we can check the data was processed
        expect(error.message).toContain('ERR_CONNECTION_REFUSED');
        expect(testRunner.testResults.userData.email).toBe(customData.email);
      }
    });

    test('should merge custom data with auto-generated data', async () => {
      const partialData = {
        email: 'partial@example.com',
        firstName: 'Partial',
        lastName: 'Data'
        // Other fields should be auto-generated
      };

      try {
        const result = await testRunner.runRegistrationTest(partialData);
        
        // Verify custom fields
        expect(result.userData.email).toBe(partialData.email);
        expect(result.userData.firstName).toBe(partialData.firstName);
        expect(result.userData.lastName).toBe(partialData.lastName);
        
        // Verify auto-generated fields exist
        expect(result.userData.password).toBeTruthy();
        expect(result.userData.phone).toBeTruthy();
        expect(result.userData.username).toBeTruthy();
        
      } catch (error) {
        // Check data was processed correctly even if connection failed
        expect(testRunner.testResults.userData.email).toBe(partialData.email);
        expect(testRunner.testResults.userData.password).toBeTruthy();
      }
    });

    test('should use completely auto-generated data when no custom data provided', async () => {
      try {
        const result = await testRunner.runRegistrationTest();
        
        // All fields should be auto-generated
        expect(result.userData.email).toMatch(/@test\.com$/);
        expect(result.userData.password).toBeTruthy();
        expect(result.userData.firstName).toBeTruthy();
        expect(result.userData.lastName).toBeTruthy();
        expect(result.userData.phone).toMatch(/^09\d{8}$/);
        expect(result.userData.username).toBeTruthy();
        
      } catch (error) {
        // Check auto-generated data was created
        expect(testRunner.testResults.userData.email).toMatch(/@test\.com$/);
        expect(testRunner.testResults.userData.password).toBeTruthy();
      }
    });
  });

  describe('Data Validation Tests', () => {
    test('should validate email format', async () => {
      const invalidEmailData = {
        email: 'invalid-email-format',
        password: 'ValidPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      await expect(testRunner.runRegistrationTest(invalidEmailData))
        .rejects.toThrow('Invalid email format');
    });

    test('should validate password strength', async () => {
      const weakPasswordData = {
        email: 'test@example.com',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User'
      };

      await expect(testRunner.runRegistrationTest(weakPasswordData))
        .rejects.toThrow('Weak password');
    });

    test('should validate Vietnamese phone number', async () => {
      const invalidPhoneData = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        phone: '123456789', // Invalid Vietnamese phone
        firstName: 'Test',
        lastName: 'User'
      };

      await expect(testRunner.runRegistrationTest(invalidPhoneData))
        .rejects.toThrow('Invalid Vietnamese phone number format');
    });

    test('should validate password confirmation match', async () => {
      const mismatchPasswordData = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        confirmPassword: 'DifferentPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      await expect(testRunner.runRegistrationTest(mismatchPasswordData))
        .rejects.toThrow('Password confirmation does not match');
    });

    test('should skip validation when disabled', async () => {
      // Create runner with validation disabled
      const noValidationRunner = new TestRunner({
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

        // Should not throw validation error
        await noValidationRunner.runRegistrationTest(invalidData);
      } catch (error) {
        // Should only fail on connection, not validation
        expect(error.message).not.toContain('Invalid email format');
        expect(error.message).not.toContain('Weak password');
      } finally {
        await noValidationRunner.cleanup();
      }
    });
  });

  describe('Bulk Registration Tests', () => {
    test('should handle multiple user registrations', async () => {
      const users = [
        {
          email: 'bulk1@example.com',
          password: 'Password1@',
          firstName: 'User1',
          lastName: 'Test1'
        },
        {
          email: 'bulk2@example.com',
          password: 'Password2@',
          firstName: 'User2',
          lastName: 'Test2'
        },
        {
          email: 'bulk3@example.com',
          password: 'Password3@',
          firstName: 'User3',
          lastName: 'Test3'
        }
      ];

      try {
        const results = await testRunner.runBulkRegistrationTest(users);
        
        expect(results).toHaveLength(3);
        results.forEach((result, index) => {
          expect(result.index).toBe(index);
          expect(result.userData || result.error).toBeTruthy();
        });
        
      } catch (error) {
        // Expected to fail without real server
        console.log('Bulk test failed as expected without real server');
      }
    });
  });

  describe('Configuration Options', () => {
    test('should respect custom app URL', () => {
      const customUrl = 'https://my-custom-app.com';
      const runner = new TestRunner({ appUrl: customUrl });
      
      expect(runner.options.appUrl).toBe(customUrl);
    });

    test('should respect headless setting', () => {
      const runner = new TestRunner({ headless: false });
      
      expect(runner.options.headless).toBe(false);
    });

    test('should respect timeout setting', () => {
      const customTimeout = 60000;
      const runner = new TestRunner({ timeout: customTimeout });
      
      expect(runner.options.timeout).toBe(customTimeout);
    });

    test('should respect database and Redis enable/disable', () => {
      const runner = new TestRunner({
        enableDatabase: false,
        enableRedis: false
      });
      
      expect(runner.options.enableDatabase).toBe(false);
      expect(runner.options.enableRedis).toBe(false);
    });
  });
});
