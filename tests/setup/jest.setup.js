const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../env.example') });

// Set test timeout
jest.setTimeout(60000);

// Global test setup
beforeAll(async () => {
  console.log('🚀 Starting test suite...');
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Override some settings for testing
  process.env.HEADLESS = 'true';
  process.env.SCREENSHOT_ON_FAILURE = 'true';
  
  console.log('✅ Test environment configured');
});

afterAll(async () => {
  console.log('🏁 Test suite completed');
});

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Custom matchers
expect.extend({
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
  
  toBeValidPhoneNumber(received) {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    const pass = phoneRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Vietnamese phone number`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Vietnamese phone number`,
        pass: false,
      };
    }
  },
  
  toHaveStrongPassword(received) {
    const hasLength = received.length >= 8;
    const hasUppercase = /[A-Z]/.test(received);
    const hasLowercase = /[a-z]/.test(received);
    const hasNumber = /\d/.test(received);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(received);
    
    const pass = hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a strong password`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a strong password (8+ chars, uppercase, lowercase, number, special char)`,
        pass: false,
      };
    }
  }
});

console.log('📋 Jest setup completed');
