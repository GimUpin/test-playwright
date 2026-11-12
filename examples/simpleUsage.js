#!/usr/bin/env node

/**
 * Simple usage example - Cách sử dụng đơn giản nhất
 */

const TestRunner = require('../src/utils/testRunner');

async function quickTest() {
  const testRunner = new TestRunner({
    appUrl: 'https://your-registration-page.com',
    headless: true
  });

  try {
    await testRunner.initialize();

    // Test với data tùy chỉnh
    const result = await testRunner.runRegistrationTest({
      email: 'your.email@example.com',
      password: 'YourPassword123!',
      firstName: 'Tên',
      lastName: 'Họ',
      phone: '0987654321'
    });

    console.log('Test result:', result.success ? 'SUCCESS' : 'FAILED');
    if (!result.success) {
      console.log('Errors:', result.errors);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await testRunner.cleanup();
  }
}

// Chạy với data hoàn toàn tự động
async function autoTest() {
  const testRunner = new TestRunner({
    appUrl: 'https://your-registration-page.com'
  });

  try {
    await testRunner.initialize();
    
    // Không truyền gì cả - tất cả sẽ được tự generate
    const result = await testRunner.runRegistrationTest();
    
    console.log('Auto-generated test:', result.success ? 'SUCCESS' : 'FAILED');
    console.log('Generated email:', result.userData.email);
    
  } catch (error) {
    console.error('Auto test failed:', error.message);
  } finally {
    await testRunner.cleanup();
  }
}

// Uncomment để chạy test
// quickTest();
// autoTest();

module.exports = { quickTest, autoTest };
