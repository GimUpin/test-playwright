#!/usr/bin/env node

const TestRunner = require('../src/utils/testRunner');
const logger = require('../src/utils/logger');

/**
 * Example script showing how to run registration tests with custom parameters
 */

async function runCustomRegistrationTest() {
  console.log('🚀 Starting custom registration test...\n');

  // Tạo TestRunner với custom options
  const testRunner = new TestRunner({
    appUrl: 'https://your-app.com',  // Thay bằng URL thật của bạn
    headless: false,                 // Hiển thị browser để debug
    screenshotOnFailure: true,
    timeout: 30000,
    validateInputs: true,
    cleanupAfterTest: true
  });

  try {
    // Khởi tạo browser
    await testRunner.initialize();

    // Test case 1: Sử dụng custom data hoàn toàn
    console.log('📝 Test 1: Custom user data');
    const customUserData = {
      email: 'test.user@example.com',
      password: 'MyStrongP@ssw0rd!',
      confirmPassword: 'MyStrongP@ssw0rd!',
      firstName: 'Nguyễn',
      lastName: 'Văn An',
      username: 'nguyenvanan',
      phone: '0987654321',
      dateOfBirth: '15/06/1995',
      address: '123 Đường ABC',
      city: 'Hà Nội',
      postalCode: '10000'
    };

    const result1 = await testRunner.runRegistrationTest(customUserData);
    console.log('✅ Test 1 result:', result1.success ? 'PASSED' : 'FAILED');
    if (!result1.success) {
      console.log('❌ Errors:', result1.errors);
    }

    // Test case 2: Một phần custom, một phần auto-generate
    console.log('\n📝 Test 2: Partial custom data');
    const partialUserData = {
      email: 'partial.user@example.com',
      password: 'AnotherStr0ng@Pass',
      firstName: 'Trần',
      lastName: 'Thị Mai',
      // Các field khác sẽ được tự generate
    };

    const result2 = await testRunner.runRegistrationTest(partialUserData);
    console.log('✅ Test 2 result:', result2.success ? 'PASSED' : 'FAILED');
    if (!result2.success) {
      console.log('❌ Errors:', result2.errors);
    }

    // Test case 3: Hoàn toàn auto-generate
    console.log('\n📝 Test 3: Auto-generated data');
    const result3 = await testRunner.runRegistrationTest();
    console.log('✅ Test 3 result:', result3.success ? 'PASSED' : 'FAILED');
    console.log('🔢 Generated email:', result3.userData?.email);

    // Test case 4: Bulk testing với multiple users
    console.log('\n📝 Test 4: Bulk registration test');
    const bulkUsers = [
      { email: 'bulk1@example.com', password: 'Password1@', firstName: 'User1', lastName: 'Test1' },
      { email: 'bulk2@example.com', password: 'Password2@', firstName: 'User2', lastName: 'Test2' },
      { email: 'bulk3@example.com', password: 'Password3@', firstName: 'User3', lastName: 'Test3' }
    ];

    const bulkResults = await testRunner.runBulkRegistrationTest(bulkUsers);
    console.log('✅ Bulk test completed:');
    bulkResults.forEach((result, index) => {
      console.log(`  User ${index + 1}: ${result.success ? 'PASSED' : 'FAILED'}`);
    });

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Cleanup
    await testRunner.cleanup();
    console.log('\n🧹 Cleanup completed');
  }
}

// Chạy test nếu file này được gọi trực tiếp
if (require.main === module) {
  runCustomRegistrationTest()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runCustomRegistrationTest };
