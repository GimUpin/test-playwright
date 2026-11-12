#!/usr/bin/env node

const MultiStepTestRunner = require('../src/utils/multiStepTestRunner');
const logger = require('../src/utils/logger');

/**
 * Test với Terminal OTP Entry
 * Framework sẽ tự động điền form, đợi tester nhập OTP qua terminal, 
 * sau đó tự động fill OTP vào 6 input fields trên giao diện
 */

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (const arg of args) {
    if (arg.startsWith('--email=')) {
      options.email = arg.split('=')[1];
    } else if (arg.startsWith('--phone=')) {
      options.phone = arg.split('=')[1];
    } else if (arg.startsWith('--first=')) {
      options.firstName = arg.split('=')[1];
    } else if (arg.startsWith('--last=')) {
      options.lastName = arg.split('=')[1];
    } else if (arg.startsWith('--country=')) {
      options.countryCode = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }
  
  return options;
}

function showHelp() {
  console.log(`
🔑 Terminal OTP Test

Usage:
  node examples/terminalOtpTest.js [options]

Options:
  --email=your.email@domain.com     Email để đăng ký (REQUIRED)
  --phone=987654321                 Số điện thoại (optional, default: auto-generated)
  --first=FirstName                 Tên (optional, default: auto-generated)
  --last=LastName                   Họ (optional, default: auto-generated)
  --country=+84                     Country code (optional, default: +84)
  --help, -h                        Hiển thị help này

Examples:
  node examples/terminalOtpTest.js --email=test@example.com
  node examples/terminalOtpTest.js --email=user@domain.com --phone=123456789
  node examples/terminalOtpTest.js --email=test@example.com --first=John --last=Doe

Features:
  - Automated form filling
  - Terminal OTP input
  - Auto-fill OTP vào 6 input fields
  - Automatic OTP verification
  - Real-time progress monitoring
  `);
}

async function runTerminalOtpTest() {
  console.log('🔑 Starting Terminal OTP Test...\n');

  // Parse command line arguments
  const cliOptions = parseArgs();
  
  if (!cliOptions.email) {
    console.error('❌ Error: --email parameter is required!');
    console.log('💡 Use --help for usage information');
    process.exit(1);
  }

  console.log('📋 Command line options:', cliOptions);

  const testRunner = new MultiStepTestRunner({
    appUrl: 'https://pub-portal-dev.mp.directsale.vn/authentication/register?lang=vi',
    headless: false,                               // Hiển thị browser để theo dõi
    screenshotOnFailure: true,
    validateInputs: true,
    
    // Terminal OTP Configuration
    waitForTerminalOtp: true,                      // Enable terminal OTP entry
    terminalOtpTimeout: 600000,                    // 10 minutes timeout
    waitForOtpEmail: true,                         // Đợi email được gửi
    otpCode: null,                                 // Không cung cấp OTP tự động
    
    // Other settings
    skipCaptcha: true,                             // Skip captcha nếu có
    enableDatabase: false,                         // Không lưu DB cho test
    enableRedis: false,
    cleanupAfterTest: false
  });

  try {
    await testRunner.initialize();
    console.log('✅ Framework initialized');

    // Build user data từ CLI options
    const userData = {
      email: cliOptions.email,
      firstName: cliOptions.firstName || 'Terminal',
      lastName: cliOptions.lastName || 'OTP',
      phone: cliOptions.phone || '987654321',
      countryCode: cliOptions.countryCode || '+84'
    };

    console.log('📋 User data for registration:', userData);
    console.log('\n🚀 Starting automated registration flow...');
    console.log('📧 Email will be sent to:', userData.email);
    console.log('🔑 OTP will be requested via terminal\n');

    // Chạy complete flow với terminal OTP
    const result = await testRunner.runCompleteRegistrationFlow(userData, {
      waitForTerminalOtp: true,
      terminalOtpTimeout: 600000                     // 10 minutes for OTP entry
    });

    if (result.success) {
      console.log('\n🎉 Registration completed successfully!');
      console.log('📧 Email:', result.userData.email);
      console.log('✅ All steps completed');
      console.log('🔑 OTP was entered via terminal and auto-filled');
    } else {
      console.log('\n❌ Registration failed');
      console.log('📋 Error:', result.error);
      console.log('🔍 Check screenshots for details');
    }

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.log('🔍 Check logs and screenshots for more details');
  } finally {
    console.log('\n⏱️  Keeping browser open for 30 seconds for inspection...');
    await testRunner.wait(60000);
    
    await testRunner.cleanup();
    console.log('✅ Test completed');
  }
}

// Quick test - chỉ test OTP step
async function runQuickOtpTest() {
  console.log('⚡ Quick OTP test...\n');

  const testRunner = new MultiStepTestRunner({
    appUrl: 'https://pub-portal-dev.mp.directsale.vn/authentication/register?lang=vi',
    headless: false,
    waitForTerminalOtp: true,
    waitForOtpEmail: false,
    enableDatabase: false,
    enableRedis: false
  });

  try {
    await testRunner.initialize();

    const userData = {
      email: 'quick.otp@example.com',
      firstName: 'Quick',
      lastName: 'OTP',
      phone: '999888777',
      countryCode: '+84'
    };

    console.log('🚀 Running quick test to reach OTP step...');
    
    try {
      await testRunner.runCompleteRegistrationFlow(userData);
    } catch (error) {
      console.log('✅ Reached OTP step (expected)');
      console.log('📍 Current URL:', await testRunner.registerPage.getCurrentUrl());
      
      // Test OTP entry
      console.log('\n🔑 Testing OTP entry...');
      const otpResult = await testRunner.registerPage.waitForTerminalOtpEntry(60000);
      console.log('OTP Result:', otpResult);
    }

  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
  } finally {
    await testRunner.wait(5000);
    await testRunner.cleanup();
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--quick') || args.includes('-q')) {
    await runQuickOtpTest();
  } else {
    await runTerminalOtpTest();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Terminal OTP test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Terminal OTP test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { 
  runTerminalOtpTest, 
  runQuickOtpTest,
  parseArgs 
};
