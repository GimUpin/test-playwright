#!/usr/bin/env node

const MultiStepTestRunner = require('../src/utils/multiStepTestRunner');
const logger = require('../src/utils/logger');

/**
 * Test với Manual OTP Entry
 * Framework sẽ tự động điền form, click submit và đợi tester nhập OTP
 */

async function runManualOtpTest() {
  console.log('🔑 Testing with Manual OTP Entry...\n');

  const testRunner = new MultiStepTestRunner({
    appUrl: 'https://pub-portal-dev.mp.directsale.vn/authentication/register?lang=vi',
    headless: false,                               // PHẢI false để tester có thể nhập OTP
    screenshotOnFailure: true,
    validateInputs: true,
    
    // OTP Configuration
    otpCode: null,                                 // Không cung cấp OTP code
    waitForManualOtp: true,                        // Đợi tester nhập manual
    manualOtpTimeout: 600000,                      // 10 minutes timeout
    waitForOtpEmail: true,                         // Đợi email được gửi
    
    // Other settings
    skipCaptcha: true,                             // Skip captcha nếu có
    enableDatabase: false,                         // Không lưu DB cho test
    enableRedis: false,
    cleanupAfterTest: false
  });

  try {
    await testRunner.initialize();
    console.log('✅ Framework initialized');

    // User data - có thể thay đổi theo ý muốn
    const userData = {
      email: 'tester.otp@example.com',             // Thay email thật để nhận OTP
      firstName: 'Tester',
      lastName: 'OTP',
      phone: '987654321',
      countryCode: '+84'
    };

    console.log('📋 User data for registration:', userData);
    console.log('\n🚀 Starting automated registration flow...');

    // Chạy complete flow với manual OTP
    const result = await testRunner.runCompleteRegistrationFlow(userData, {
      waitForManualOtp: true,
      manualOtpTimeout: 600000                     // 10 minutes for OTP entry
    });

    if (result.success) {
      console.log('\n🎉 Registration completed successfully!');
      console.log('📧 Email:', result.userData.email);
      console.log('✅ All steps completed');
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
    await testRunner.wait(30000);
    
    await testRunner.cleanup();
    console.log('✅ Test completed');
  }
}

// Step-by-step manual test (với pause giữa các bước)
async function runStepByStepManualTest() {
  console.log('🔍 Running step-by-step manual OTP test...\n');

  const testRunner = new MultiStepTestRunner({
    appUrl: 'https://pub-portal-dev.mp.directsale.vn/authentication/register?lang=vi',
    headless: false,
    enableDatabase: false,
    enableRedis: false
  });

  try {
    await testRunner.initialize();

    const userData = {
      email: 'step.by.step@example.com',
      firstName: 'Step',
      lastName: 'Test',
      phone: '123456789',
      countryCode: '+84'
    };

    console.log('📝 Step 1: Navigate and fill basic information');
    await testRunner.registerPage.navigate();
    await testRunner.wait(3000);
    
    await testRunner.registerPage.fillBasicInformation(userData);
    console.log('✅ Basic information filled');
    await testRunner.wait(2000);

    console.log('\n📝 Step 2: Click continue button');
    await testRunner.registerPage.clickContinueButton();
    console.log('✅ Continue button clicked');
    await testRunner.wait(5000);

    console.log('\n📝 Step 3: Check current URL');
    const currentUrl = await testRunner.registerPage.getCurrentUrl();
    console.log('📍 Current URL:', currentUrl);

    if (currentUrl.includes('verify')) {
      console.log('\n📝 Step 4: Manual OTP Entry');
      const manualResult = await testRunner.registerPage.waitForManualOtpEntry(600000);
      
      if (manualResult.success) {
        console.log('✅ Manual OTP completed successfully!');
      } else {
        console.log('❌ Manual OTP failed:', manualResult.message);
      }
    } else {
      console.log('⚠️  Not redirected to verify page, check the flow');
    }

  } catch (error) {
    console.error('❌ Step-by-step test failed:', error.message);
  } finally {
    await testRunner.wait(10000);
    await testRunner.cleanup();
  }
}

// Quick test - chỉ đến step OTP
async function runQuickOtpTest() {
  console.log('⚡ Quick test to OTP step...\n');

  const testRunner = new MultiStepTestRunner({
    appUrl: 'https://pub-portal-dev.mp.directsale.vn/authentication/register?lang=vi',
    headless: false,
    waitForManualOtp: false,                       // Không đợi manual OTP
    waitForOtpEmail: false,                        // Không đợi email
    enableDatabase: false,
    enableRedis: false
  });

  try {
    await testRunner.initialize();

    const userData = {
      email: 'quick.test@example.com',
      firstName: 'Quick',
      lastName: 'Test',
      phone: '999888777',
      countryCode: '+84'
    };

    console.log('🚀 Running quick test to reach OTP step...');
    
    try {
      await testRunner.runCompleteRegistrationFlow(userData);
    } catch (error) {
      console.log('✅ Reached OTP step (expected error)');
      console.log('📍 Current URL:', await testRunner.registerPage.getCurrentUrl());
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
  
  if (args.includes('--step-by-step') || args.includes('-s')) {
    await runStepByStepManualTest();
  } else if (args.includes('--quick') || args.includes('-q')) {
    await runQuickOtpTest();
  } else {
    await runManualOtpTest();
  }
}

// Usage instructions
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔑 Manual OTP Test

Usage:
  node examples/manualOtpTest.js                    # Full test with manual OTP
  node examples/manualOtpTest.js --step-by-step     # Step-by-step debug mode
  node examples/manualOtpTest.js --quick            # Quick test to OTP step

Features:
  - Automated form filling
  - Automated navigation to OTP step
  - Manual OTP entry by tester
  - Automatic detection of OTP success/failure
  - Configurable timeouts
  - Progress monitoring

Instructions:
  1. Update email in the script to your real email
  2. Run the test
  3. Wait for OTP email
  4. Enter OTP in the browser manually
  5. Test will continue automatically

Configuration:
  - manualOtpTimeout: 600000 (10 minutes)
  - Browser: Non-headless (visible)
  - Screenshots: On failure
  
Note: Make sure to use a real email to receive OTP!
  `);
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Manual OTP test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Manual OTP test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { 
  runManualOtpTest, 
  runStepByStepManualTest, 
  runQuickOtpTest 
};
