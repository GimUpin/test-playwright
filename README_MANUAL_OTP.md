# 🔑 Manual OTP Testing Framework

## Tổng Quan

Framework automation test hỗ trợ **Manual OTP Entry** - tự động điền form đăng ký và đợi tester nhập OTP manually trong browser.

## 🎯 Luồng Test

```
1. Tự động điền thông tin cơ bản (email, tên, phone)
2. Tự động click "Tiếp tục" 
3. Tự động xử lý captcha (nếu có)
4. Tự động đợi validation và redirect
5. 🔑 PAUSE - Đợi tester nhập OTP manually
6. Tự động detect OTP success và hoàn thành
```

## 🚀 Cách Sử Dụng

### Option 1: Full Automated + Manual OTP
```bash
npm run example:manual-otp
```

### Option 2: Step-by-Step Debug
```bash
npm run example:otp-step
```

### Option 3: Quick Test đến OTP
```bash
npm run example:quick-otp
```

## 📝 Configuration

### Basic Configuration
```javascript
const testRunner = new MultiStepTestRunner({
  appUrl: 'https://your-registration-url.com',
  headless: false,                               // PHẢI false để nhập OTP
  
  // Manual OTP Settings
  waitForManualOtp: true,                        // Đợi tester nhập OTP
  manualOtpTimeout: 600000,                      // 10 minutes timeout
  otpCode: null,                                 // Không cung cấp OTP tự động
  
  // Other settings
  skipCaptcha: true,                             // Skip captcha nếu có
  validateInputs: true,
  screenshotOnFailure: true
});
```

### Advanced Configuration
```javascript
const testRunner = new MultiStepTestRunner({
  // App & Browser
  appUrl: 'https://your-app.com/register',
  headless: false,                               // Required for manual input
  screenshotOnFailure: true,
  timeout: 30000,
  
  // Flow Control
  skipCaptcha: false,                            // Xử lý captcha
  waitForOtpEmail: true,                         // Đợi email được gửi
  waitForManualOtp: true,                        // Đợi manual OTP entry
  manualOtpTimeout: 600000,                      // 10 minutes cho OTP
  
  // Validation
  validateInputs: true,                          // Validate data trước test
  
  // Database & Redis
  enableDatabase: false,                         // Không lưu DB cho test
  enableRedis: false,
  cleanupAfterTest: false,
  
  // Timeouts
  validationTimeout: 15000,                      // Đợi validation
  otpEmailTimeout: 120000,                       // Đợi email OTP
  captchaTimeout: 30000                          // Timeout cho captcha
});
```

## 🔧 Example Usage

### Ví dụ 1: Test với email thật
```javascript
const testRunner = new MultiStepTestRunner({
  appUrl: 'https://your-site.com/register',
  headless: false,
  waitForManualOtp: true,
  manualOtpTimeout: 600000                       // 10 minutes
});

await testRunner.initialize();

const userData = {
  email: 'your.real.email@domain.com',           // ⚠️ Dùng email thật để nhận OTP
  firstName: 'Tester',
  lastName: 'Manual',
  phone: '987654321',
  countryCode: '+84'
};

const result = await testRunner.runCompleteRegistrationFlow(userData);
```

### Ví dụ 2: Chỉ test step-by-step
```javascript
// Navigate và fill form
await testRunner.registerPage.navigate();
await testRunner.registerPage.fillBasicInformation(userData);
await testRunner.registerPage.clickContinueButton();

// Manual OTP entry
if (currentUrl.includes('verify')) {
  const result = await testRunner.registerPage.waitForManualOtpEntry(600000);
  console.log('OTP Result:', result);
}
```

## 📋 Manual OTP Process

### Khi Framework đến bước OTP:

```
🔑 ================= MANUAL OTP ENTRY =================
📧 Please check your email for the OTP code
⌨️  Enter the OTP code in the browser manually  
🕐 You have up to 10 minutes to complete this
✅ The test will continue automatically after OTP verification
======================================================

⏱️  Still waiting for manual OTP entry... (580s remaining)
⏱️  Still waiting for manual OTP entry... (550s remaining)
...
```

### Tester cần làm:
1. 📧 **Check email** nhận OTP code
2. 🌐 **Vào browser** (đang mở) 
3. ⌨️ **Nhập OTP** vào form
4. 🖱️ **Click verify** hoặc submit
5. ✅ **Framework tự động detect** thành công và tiếp tục

### Framework sẽ tự động:
- Monitor URL changes
- Detect success messages
- Detect error messages (cho phép retry)
- Track progress với countdown
- Auto-complete khi thành công

## 🎯 Detection Logic

Framework detect OTP success qua:

### URL Redirect:
```javascript
// Success URLs
currentUrl.includes('success')
currentUrl.includes('complete') 
currentUrl.includes('welcome')
currentUrl.includes('dashboard')
```

### Success Messages:
```javascript
// Success selectors
'.success-container'
'.registration-complete'
'.welcome-message'
'.success'
```

### Error Handling:
- Detect OTP errors nhưng **không fail test**
- Cho phép tester **retry** OTP
- Chỉ fail khi **timeout**

## ⚡ Quick Commands

```bash
# Test đầy đủ với manual OTP
npm run example:manual-otp

# Debug step-by-step 
npm run example:otp-step

# Test nhanh đến OTP
npm run example:quick-otp

# Debug selectors
npm run example:debug-selectors

# Test form fill only
npm run example:real
```

## 🛠️ Customization

### Custom Selectors
Update trong `src/pages/MultiStepRegisterPage.js`:
```javascript
this.selectors = {
  step1: {
    emailInput: 'input[formcontrolname="email"]',
    // ... your selectors
  },
  otp: {
    otpContainer: '.your-otp-container',
    otpInput: '#your-otp-input',
    // ... your OTP selectors  
  }
};
```

### Custom Timeouts
```javascript
const testRunner = new MultiStepTestRunner({
  manualOtpTimeout: 900000,                      // 15 minutes
  validationTimeout: 20000,                      // 20 seconds
  otpEmailTimeout: 180000                        // 3 minutes
});
```

### Custom Success Detection
```javascript
// Trong waitForManualOtpEntry method
if (currentUrl.includes('your-success-page') || 
    await this.elementExists('.your-success-class')) {
  return { success: true };
}
```

## 🚫 Troubleshooting

### Issue: OTP không được detect
**Solution**: Check selectors và success URLs
```javascript
// Debug OTP selectors
npm run example:debug-selectors
```

### Issue: Timeout quá ngắn
**Solution**: Tăng manualOtpTimeout
```javascript
manualOtpTimeout: 900000  // 15 minutes
```

### Issue: Email không đến
**Solution**: 
- Check email thật trong userData
- Check spam folder
- Tăng otpEmailTimeout

### Issue: Form validation fail
**Solution**: Check phone format và required fields
```javascript
// Phone phải không có leading 0
phone: '987654321'  // ✅ Đúng
phone: '0987654321' // ❌ Sai
```

## 📊 Monitoring & Logs

Framework cung cấp detailed logs:
```
info: Manual OTP entry instructions displayed
info: URL changed, checking if OTP verification was successful  
info: Manual OTP entry completed successfully
```

Screenshots tự động khi có error:
```
screenshots/multi_step_registration_error_*.png
```

## 🎉 Success Output

Khi thành công:
```
✅ OTP verification successful! URL redirected to: https://app.com/dashboard
✅ Step 1 completed successfully!
🎉 Registration completed successfully!
```

## 📞 Support

Nếu cần help:
1. Check logs trong console
2. Check screenshots trong `/screenshots/`
3. Run debug mode: `npm run example:otp-step`
4. Check selectors: `npm run example:debug-selectors`

---

**Framework sẵn sàng cho production testing! 🚀**
