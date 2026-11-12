const TestHelpers = require('../../src/utils/helpers');

describe('Test Helpers', () => {
  describe('Email Generation', () => {
    test('should generate valid email format', () => {
      const email = TestHelpers.generateRandomEmail();
      expect(email).toBeValidEmail();
      expect(email).toMatch(/@test\.com$/);
    });

    test('should generate email with custom domain', () => {
      const domain = 'custom.com';
      const email = TestHelpers.generateRandomEmail(domain);
      expect(email).toBeValidEmail();
      expect(email).toMatch(new RegExp(`@${domain}$`));
    });

    test('should generate unique emails', () => {
      const email1 = TestHelpers.generateRandomEmail();
      const email2 = TestHelpers.generateRandomEmail();
      expect(email1).not.toBe(email2);
    });
  });

  describe('Phone Number Generation', () => {
    test('should generate valid Vietnamese phone number', () => {
      const phone = TestHelpers.generateRandomPhone();
      expect(phone).toBeValidPhoneNumber();
      expect(phone).toHaveLength(10);
    });

    test('should generate phone with custom prefix', () => {
      const prefix = '08';
      const phone = TestHelpers.generateRandomPhone(prefix);
      expect(phone).toMatch(new RegExp(`^${prefix}`));
      expect(phone).toHaveLength(10);
    });

    test('should generate unique phone numbers', () => {
      const phone1 = TestHelpers.generateRandomPhone();
      const phone2 = TestHelpers.generateRandomPhone();
      expect(phone1).not.toBe(phone2);
    });
  });

  describe('Password Generation', () => {
    test('should generate strong password by default', () => {
      const password = TestHelpers.generateRandomPassword();
      expect(password).toHaveStrongPassword();
      expect(password).toHaveLength(12);
    });

    test('should generate password with custom length', () => {
      const length = 16;
      const password = TestHelpers.generateRandomPassword(length);
      expect(password).toHaveLength(length);
      expect(password).toHaveStrongPassword();
    });

    test('should generate unique passwords', () => {
      const password1 = TestHelpers.generateRandomPassword();
      const password2 = TestHelpers.generateRandomPassword();
      expect(password1).not.toBe(password2);
    });
  });

  describe('Random String Generation', () => {
    test('should generate string with default length', () => {
      const str = TestHelpers.generateRandomString();
      expect(str).toHaveLength(10);
      expect(str).toMatch(/^[A-Za-z0-9]+$/);
    });

    test('should generate string with custom length', () => {
      const length = 5;
      const str = TestHelpers.generateRandomString(length);
      expect(str).toHaveLength(length);
    });

    test('should generate unique strings', () => {
      const str1 = TestHelpers.generateRandomString();
      const str2 = TestHelpers.generateRandomString();
      expect(str1).not.toBe(str2);
    });
  });

  describe('Date Generation and Formatting', () => {
    test('should generate random date within range', () => {
      const startDate = '1990-01-01';
      const endDate = '2000-12-31';
      const randomDate = TestHelpers.generateRandomDate(startDate, endDate);
      
      expect(randomDate).toBeInstanceOf(Date);
      expect(randomDate.getTime()).toBeGreaterThanOrEqual(new Date(startDate).getTime());
      expect(randomDate.getTime()).toBeLessThanOrEqual(new Date(endDate).getTime());
    });

    test('should format date for input correctly', () => {
      const date = new Date('1995-06-15');
      const formatted = TestHelpers.formatDateForInput(date);
      expect(formatted).toBe('15/06/1995');
    });

    test('should format date with custom format', () => {
      const date = new Date('1995-06-15');
      const formatted = TestHelpers.formatDateForInput(date, 'YYYY-MM-DD');
      expect(formatted).toBe('1995-06-15');
    });
  });

  describe('Registration Data Generation', () => {
    test('should generate complete registration data', () => {
      const data = TestHelpers.generateRegistrationData();
      
      expect(data.email).toBeValidEmail();
      expect(data.password).toHaveStrongPassword();
      expect(data.phone).toBeValidPhoneNumber();
      expect(data.firstName).toBeTruthy();
      expect(data.lastName).toBeTruthy();
      expect(data.dateOfBirth).toBeInstanceOf(Date);
      expect(data.address).toBeTruthy();
      expect(data.city).toBeTruthy();
      expect(data.postalCode).toBeTruthy();
    });

    test('should generate unique registration data', () => {
      const data1 = TestHelpers.generateRegistrationData();
      const data2 = TestHelpers.generateRegistrationData();
      
      expect(data1.email).not.toBe(data2.email);
      expect(data1.phone).not.toBe(data2.phone);
      expect(data1.firstName).not.toBe(data2.firstName);
    });
  });

  describe('Validation Functions', () => {
    describe('Email Validation', () => {
      test('should validate correct email formats', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'test+label@example.org',
          'user123@test-domain.net'
        ];

        validEmails.forEach(email => {
          expect(TestHelpers.isValidEmail(email)).toBe(true);
        });
      });

      test('should reject invalid email formats', () => {
        const invalidEmails = [
          'invalid-email',
          '@example.com',
          'test@',
          'test..test@example.com',
          'test @example.com'
        ];

        invalidEmails.forEach(email => {
          expect(TestHelpers.isValidEmail(email)).toBe(false);
        });
      });
    });

    describe('Vietnamese Phone Validation', () => {
      test('should validate correct Vietnamese phone numbers', () => {
        const validPhones = [
          '0987654321',
          '0345678901',
          '0712345678',
          '0856789012',
          '0923456789'
        ];

        validPhones.forEach(phone => {
          expect(TestHelpers.isValidVietnamesePhone(phone)).toBe(true);
        });
      });

      test('should reject invalid Vietnamese phone numbers', () => {
        const invalidPhones = [
          '012345678',   // Invalid prefix
          '098765432',   // Too short
          '09876543210', // Too long
          '0987-654-321', // Contains dashes
          '098abc1234'   // Contains letters
        ];

        invalidPhones.forEach(phone => {
          expect(TestHelpers.isValidVietnamesePhone(phone)).toBe(false);
        });
      });
    });

    describe('Password Strength Validation', () => {
      test('should validate strong passwords', () => {
        const strongPasswords = [
          'Password123!',
          'MyStr0ng@Pass',
          'Test#Pass123',
          'C0mplex$Password'
        ];

        strongPasswords.forEach(password => {
          const result = TestHelpers.validatePasswordStrength(password);
          expect(result.isValid).toBe(true);
          expect(result.score).toBe(5);
        });
      });

      test('should identify weak passwords', () => {
        const weakPasswords = [
          'password',      // No uppercase, numbers, special chars
          'PASSWORD',      // No lowercase, numbers, special chars
          '12345678',      // No letters, special chars
          'Pass123',       // Too short, no special chars
          'Password123'    // No special chars
        ];

        weakPasswords.forEach(password => {
          const result = TestHelpers.validatePasswordStrength(password);
          expect(result.isValid).toBe(false);
          expect(result.score).toBeLessThan(5);
        });
      });
    });
  });

  describe('Utility Functions', () => {
    test('should generate OTP with correct length', () => {
      const otp = TestHelpers.generateOTP();
      expect(otp).toHaveLength(6);
      expect(otp).toMatch(/^\d{6}$/);
    });

    test('should generate OTP with custom length', () => {
      const length = 4;
      const otp = TestHelpers.generateOTP(length);
      expect(otp).toHaveLength(length);
      expect(otp).toMatch(/^\d+$/);
    });

    test('should generate timestamp', () => {
      const timestamp = TestHelpers.getTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/);
    });

    test('should clean string for selectors', () => {
      const dirtyString = 'Test String With Spaces & Special Chars!';
      const cleaned = TestHelpers.cleanString(dirtyString);
      expect(cleaned).toBe('test_string_with_spaces___special_chars_');
    });

    test('should generate unique test ID', () => {
      const id1 = TestHelpers.generateTestId();
      const id2 = TestHelpers.generateTestId();
      
      expect(id1).toMatch(/^test_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_[a-f0-9]{8}$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('Retry Function', () => {
    test('should succeed on first attempt', async () => {
      let attemptCount = 0;
      const mockFn = jest.fn(() => {
        attemptCount++;
        return Promise.resolve('success');
      });

      const result = await TestHelpers.retry(mockFn);
      expect(result).toBe('success');
      expect(attemptCount).toBe(1);
    });

    test('should retry on failure and eventually succeed', async () => {
      let attemptCount = 0;
      const mockFn = jest.fn(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Failed'));
        }
        return Promise.resolve('success');
      });

      const result = await TestHelpers.retry(mockFn, 3, 10); // Short delay for testing
      expect(result).toBe('success');
      expect(attemptCount).toBe(3);
    });

    test('should fail after max attempts', async () => {
      const mockFn = jest.fn(() => Promise.reject(new Error('Always fails')));

      await expect(TestHelpers.retry(mockFn, 2, 10)).rejects.toThrow('Always fails');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});
