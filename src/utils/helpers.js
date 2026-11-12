const moment = require('moment');
const crypto = require('crypto');

class TestHelpers {
  // Generate random email
  static generateRandomEmail(domain = 'test.com') {
    const randomString = crypto.randomBytes(8).toString('hex');
    return `test_${randomString}@${domain}`;
  }

  // Generate random phone number
  static generateRandomPhone(prefix = '09') {
    const randomNumbers = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `${prefix}${randomNumbers}`;
  }

  // Generate random password
  static generateRandomPassword(length = 12) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    
    // Ensure at least one character from each category
    let password = '';
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += special.charAt(Math.floor(Math.random() * special.length));
    
    // Fill the rest randomly
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = password.length; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Generate random string
  static generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate random date
  static generateRandomDate(startDate = '1990-01-01', endDate = '2005-12-31') {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime);
  }

  // Format date for form input
  static formatDateForInput(date, format = 'DD/MM/YYYY') {
    return moment(date).format(format);
  }

  // Wait for a specific time
  static async wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  // Retry function with exponential backoff
  static async retry(fn, maxAttempts = 3, baseDelay = 1000) {
    let attempt = 1;
    
    while (attempt <= maxAttempts) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await this.wait(delay);
        attempt++;
      }
    }
  }

  // Generate test data for registration
  static generateRegistrationData() {
    return {
      email: this.generateRandomEmail(),
      password: this.generateRandomPassword(),
      confirmPassword: '', // Will be set to password
      firstName: this.generateRandomString(8),
      lastName: this.generateRandomString(10),
      phone: this.generateRandomPhone(),
      dateOfBirth: this.generateRandomDate(),
      address: `${Math.floor(Math.random() * 999) + 1} Test Street`,
      city: 'Test City',
      postalCode: Math.floor(Math.random() * 99999).toString().padStart(5, '0')
    };
  }

  // Validate email format
  static isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    // Email validation that supports common formats
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
    const trimmed = email.trim();
    return emailRegex.test(trimmed) && !trimmed.includes('..') && !trimmed.includes(' ');
  }

  // Validate phone format (Vietnamese)
  static isValidVietnamesePhone(phone) {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return phoneRegex.test(phone);
  }

  // Validate password strength
  static validatePasswordStrength(password) {
    if (!password || typeof password !== 'string') {
      return {
        isValid: false,
        score: 0,
        checks: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false
        }
      };
    }
    
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    return {
      isValid: score === 5 && checks.length, // All 5 criteria must be met
      score: score,
      checks: checks
    };
  }

  // Generate OTP code
  static generateOTP(length = 6) {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  }

  // Create timestamp for test data
  static getTimestamp() {
    return moment().format('YYYY-MM-DD_HH-mm-ss');
  }

  // Clean string for use in selectors or IDs
  static cleanString(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  // Generate unique test identifier
  static generateTestId() {
    return `test_${this.getTimestamp()}_${crypto.randomBytes(4).toString('hex')}`;
  }
}

module.exports = TestHelpers;
