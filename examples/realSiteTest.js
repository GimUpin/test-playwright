#!/usr/bin/env node

const MultiStepTestRunner = require('../src/utils/multiStepTestRunner');
const logger = require('../src/utils/logger');

/**
 * Test với site thật: https://pub-portal-dev.mp.directsale.vn/authentication/register?lang=vi
 */

async function runRealSiteTest() {
  console.log('🌐 Testing with real site...\n');

  const testRunner = new MultiStepTestRunner({
    appUrl: 'https://pub-portal-dev.mp.directsale.vn/authentication/register?lang=vi',
    headless: false,                               // Hiển thị browser để xem
    screenshotOnFailure: true,
    validateInputs: true,
    
    // Flow settings - test đến OTP step
    skipCaptcha: true,                             // Skip captcha cho lần đầu
    waitForOtpEmail: false,                        // Không đợi email cho test nhanh
    waitForManualOtp: false,                       // Không đợi manual OTP
    
    // Disable database để test nhanh
    enableDatabase: false,
    enableRedis: false,
    cleanupAfterTest: false
  });

  try {
    await testRunner.initialize();
    console.log('✅ Framework initialized');

    // Test Case 1: Chỉ fill form step 1
    console.log('\n📝 Test 1: Fill basic information only');
    
    const userData = {
      email: 'test.automation@example.com',
      firstName: 'Test',
      lastName: 'Automation', 
      phone: '987654321',                          // Không có leading 0
      countryCode: '+84'                           // Vietnam
    };

    console.log('📋 User data:', userData);

    try {
      // Chạy từng bước riêng để debug
      await testRunner.registerPage.navigate();
      console.log('✅ Navigated to registration page');
      
      await testRunner.wait(2000);                // Đợi page load
      
      await testRunner.registerPage.fillBasicInformation(userData);
      console.log('✅ Basic information filled');
      
      await testRunner.wait(2000);                // Pause để xem
      
      // Kiểm tra button có enabled không
      const buttonEnabled = await testRunner.registerPage.isElementEnabled(
        testRunner.registerPage.selectors.step1.continueButton
      );
      console.log('🔘 Continue button enabled:', buttonEnabled);
      
      if (buttonEnabled) {
        console.log('🎯 Clicking continue button...');
        await testRunner.registerPage.clickContinueButton();
        await testRunner.wait(5000);              // Đợi xem response
        
        const currentUrl = await testRunner.registerPage.getCurrentUrl();
        console.log('📍 Current URL after click:', currentUrl);
        
        console.log('✅ Step 1 completed successfully!');
      } else {
        console.log('⚠️  Continue button is disabled - form validation may have failed');
      }

    } catch (stepError) {
      console.error('❌ Step error:', stepError.message);
      await testRunner.registerPage.takeScreenshot('step_error');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    console.log('\n⏱️  Waiting 10 seconds for manual inspection...');
    await testRunner.wait(10000);                 // Đợi để xem kết quả
    
    await testRunner.cleanup();
    console.log('✅ Test completed');
  }
}

// Debug selectors test
async function debugSelectorsTest() {
  console.log('🔍 Debug selectors test...\n');

  const testRunner = new MultiStepTestRunner({
    appUrl: 'https://pub-portal-dev.mp.directsale.vn/authentication/register?lang=vi',
    headless: false,
    enableDatabase: false,
    enableRedis: false
  });

  try {
    await testRunner.initialize();
    await testRunner.registerPage.navigate();
    await testRunner.wait(3000);

    const selectors = testRunner.registerPage.selectors.step1;
    
    console.log('🔎 Checking selectors...');
    for (const [name, selector] of Object.entries(selectors)) {
      const exists = await testRunner.registerPage.elementExists(selector);
      console.log(`  ${name}: ${selector} - ${exists ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await testRunner.wait(5000);
    await testRunner.cleanup();
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--debug-selectors') || args.includes('-d')) {
    await debugSelectorsTest();
  } else {
    await runRealSiteTest();
  }
}

// Usage instructions
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🌐 Real Site Test

Usage:
  node examples/realSiteTest.js                    # Test basic flow
  node examples/realSiteTest.js --debug-selectors  # Debug selectors

Features:
  - Tests with real registration page
  - Visual browser mode for inspection
  - Step-by-step execution
  - Selector validation
  - Screenshot on errors

Note: Make sure the site is accessible and selectors are correct!
  `);
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Real site test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Real site test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runRealSiteTest, debugSelectorsTest };
