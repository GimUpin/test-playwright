# 🔑 Terminal OTP Testing Framework

## Tổng Quan

Framework automation test hỗ trợ **Terminal OTP Entry** - tự động điền form đăng ký, đợi tester nhập OTP qua terminal, sau đó tự động fill OTP vào 6 input fields trên giao diện.

## 🎯 Luồng Test

```
1. 🤖 Tự động điền thông tin cơ bản (email, tên, phone)
2. 🤖 Tự động click "Tiếp tục" 
3. 🤖 Tự động xử lý captcha (nếu có)
4. 🤖 Tự động đợi validation và redirect
5. 🔑 PAUSE - Đợi tester nhập OTP qua terminal
6. 🤖 Tự động fill OTP vào 6 input fields
7. 🤖 Tự động verify OTP và hoàn thành
```

## 🚀 Cách Sử Dụng

### Basic Usage với Email Parameter
```bash
npm run example:terminal-otp -- --email=your.email@domain.com
```

### Advanced Usage với Multiple Parameters
```bash
npm run example:terminal-otp -- --email=user@domain.com --phone=123456789 --first=John --last=Doe --country=+84
```

### Help Command
```bash
npm run example:terminal-otp-help
```

## 📝 Command Line Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--email=` | ✅ **YES** | - | Email để đăng ký (bắt buộc) |
| `--phone=` | ❌ No | Auto-generated | Số điện thoại |
| `--first=` | ❌ No | "Terminal" | Tên |
| `--last=` | ❌ No | "OTP" | Họ |
| `--country=` | ❌ No | "+84" | Country code |

## 🔧 Configuration

### Basic Configuration
```javascript
const testRunner = new MultiStepTestRunner({
  appUrl: 'https://your-registration-url.com',
  headless: false,                               // PHẢI false để theo dõi
  
  // Terminal OTP Settings
  waitForTerminalOtp: true,                      // Enable terminal OTP entry
  terminalOtpTimeout: 600000,                    // 10 minutes timeout
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
  headless: false,                               // Required for visual monitoring
  screenshotOnFailure: true,
  timeout: 30000,
  
  // Terminal OTP Control
  waitForTerminalOtp: true,                      // Enable terminal OTP
  terminalOtpTimeout: 900000,                    // 15 minutes cho OTP
  waitForOtpEmail: true,                         // Đợi email được gửi
  otpCode: null,                                 // No auto OTP
  
  // Flow Control
  skipCaptcha: false,                            // Xử lý captcha
  waitForManualOtp: false,                       // Disable manual browser OTP
  
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

## 📋 Example Usage

### Ví dụ 1: Test với email thật
```bash
npm run example:terminal-otp -- --email=your.real.email@domain.com
```

### Ví dụ 2: Test với đầy đủ parameters
```bash
npm run example:terminal-otp -- --email=test.user@company.com --phone=987654321 --first=Test --last=User --country=+84
```

### Ví dụ 3: Test nhanh
```bash
npm run example:terminal-otp -- --email=quick@test.com --quick
```

## 🔑 Terminal OTP Process

### Khi Framework đến bước OTP:

```
🔑 ================= TERMINAL OTP ENTRY =================
📧 Please check your email for the OTP code
⌨️  Enter the OTP code in the terminal below:
🕐 You have up to 10 minutes to complete this
✅ The test will continue automatically after OTP verification
======================================================

🔐 Enter OTP code (6 digits): _
```

### Tester cần làm:
1. 📧 **Check email** nhận OTP code
2. ⌨️ **Nhập OTP** vào terminal (6 digits)
3. 🔄 **Press Enter**
4. ✅ **Framework tự động**:
   - Fill OTP vào 6 input fields
   - Verify OTP
   - Complete registration

### Framework sẽ tự động:
- Parse OTP từ terminal input
- Validate OTP format (6 digits)
- Auto-fill vào 6 input fields
- Auto-verify OTP
- Continue với registration flow

## 🎯 OTP Input Fields Detection

Framework tự động detect và fill OTP vào 6 input fields:

```html
<div class="otp-container">
  <input class="otp-input" maxlength="2" type="text">  <!-- Digit 1 -->
  <input class="otp-input" maxlength="2" type="text">  <!-- Digit 2 -->
  <input class="otp-input" maxlength="2" type="text">  <!-- Digit 3 -->
  <input class="otp-input" maxlength="2" type="text">  <!-- Digit 4 -->
  <input class="otp-input" maxlength="2" type="text">  <!-- Digit 5 -->
  <input class="otp-input" maxlength="2" type="text">  <!-- Digit 6 -->
</div>
```

### Auto-fill Process:
1. **Clear fields**: Clear tất cả input fields
2. **Sequential fill**: Fill từng digit vào từng field
3. **Validation**: Kiểm tra OTP format
4. **Auto-submit**: Tự động submit form

## ⚡ Quick Commands

```bash
# Terminal OTP Testing
npm run example:terminal-otp -- --email=test@example.com
npm run example:terminal-otp -- --email=user@domain.com --phone=123456789

# Help & Documentation
npm run example:terminal-otp-help

# Other OTP Methods
npm run example:manual-otp              # Manual browser OTP
npm run example:otp-step                # Step-by-step debug
npm run example:quick-otp               # Quick test đến OTP

# Utilities
npm run example:debug-selectors         # Debug selectors
npm run example:real                    # Test form fill only
```

## 🛠️ Customization

### Custom OTP Selectors
Update trong `src/pages/MultiStepRegisterPage.js`:
```javascript
this.selectors = {
  otp: {
    otpContainer: '.your-otp-container',
    otpInputs: '.your-otp-input',     // 6 input fields
    verifyOtpButton: 'button[type="submit"]',
    // ... other selectors
  }
};
```

### Custom Timeouts
```javascript
const testRunner = new MultiStepTestRunner({
  terminalOtpTimeout: 900000,                      // 15 minutes
  validationTimeout: 20000,                        // 20 seconds
  otpEmailTimeout: 180000                          // 3 minutes
});
```

### Custom OTP Validation
```javascript
// Trong waitForTerminalOtpEntry method
if (!otpCode || otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
  throw new Error('Invalid OTP code. Must be exactly 6 digits.');
}
```

## 🚫 Troubleshooting

### Issue: OTP không được fill đúng
**Solution**: Check OTP selectors và input field count
```javascript
// Debug OTP selectors
const inputs = await page.$$('.otp-input');
console.log('OTP inputs found:', inputs.length); // Should be 6
```

### Issue: Terminal input không hoạt động
**Solution**: Check readline module và terminal compatibility
```bash
# Test terminal input
node -e "const readline = require('readline'); console.log('readline available')"
```

### Issue: OTP validation fail
**Solution**: Check OTP format và length
```bash
# OTP phải đúng 6 digits
🔐 Enter OTP code (6 digits): 123456  # ✅ Đúng
🔐 Enter OTP code (6 digits): 123     # ❌ Sai (thiếu digits)
🔐 Enter OTP code (6 digits): 12345a  # ❌ Sai (có ký tự)
```

### Issue: Email không đến
**Solution**: 
- Check email thật trong `--email=` parameter
- Check spam folder
- Tăng `otpEmailTimeout`

## 📊 Monitoring & Logs

Framework cung cấp detailed logs:
```
info: Terminal OTP entry instructions displayed
info: OTP code received from terminal
info: Multiple OTP input fields detected: 6 fields
info: Filled OTP digit 1: 1
info: Filled OTP digit 2: 2
...
info: OTP code filled into 6 input fields
info: OTP verification successful
```

Screenshots tự động khi có error:
```
screenshots/terminal_otp_error_*.png
screenshots/otp_entry_error_*.png
```

## 🎉 Success Output

Khi thành công:
```
✅ OTP code received: 123456
✅ OTP code filled automatically
✅ OTP verification successful!
🎉 Registration completed successfully!
🔑 OTP was entered via terminal and auto-filled
```

## 📞 Support

Nếu cần help:
1. Check logs trong console
2. Check screenshots trong `/screenshots/`
3. Run help: `npm run example:terminal-otp-help`
4. Debug selectors: `npm run example:debug-selectors`
5. Check OTP input fields count

## 🔄 Comparison với Manual OTP

| Feature | Terminal OTP | Manual Browser OTP |
|---------|--------------|-------------------|
| **Input Method** | Terminal | Browser |
| **Auto-fill** | ✅ Yes | ❌ No |
| **Validation** | ✅ Yes | ❌ No |
| **Speed** | ⚡ Fast | 🐌 Slow |
| **User Experience** | 🎯 Excellent | 😕 Manual |
| **Error Handling** | ✅ Smart | ⚠️ Basic |
| **Progress Tracking** | ✅ Real-time | ❌ Limited |

## 🎯 Best Practices

### 1. Email Management
```bash
# Sử dụng email thật để nhận OTP
--email=your.real.email@company.com

# Không sử dụng email fake
--email=test@example.com  # ❌ Không nhận được OTP
```

### 2. OTP Entry
```bash
# Nhập đúng 6 digits
🔐 Enter OTP code (6 digits): 123456  # ✅

# Không nhập sai format
🔐 Enter OTP code (6 digits): 123     # ❌ Thiếu digits
🔐 Enter OTP code (6 digits): abcdef  # ❌ Không phải số
```

### 3. Timeout Management
```javascript
// Đủ thời gian cho email và OTP
terminalOtpTimeout: 600000,    // 10 minutes
otpEmailTimeout: 120000,       // 2 minutes
```

### 4. Error Handling
```javascript
// Framework tự động handle errors
try {
  await testRunner.runCompleteRegistrationFlow(userData);
} catch (error) {
  console.log('Error details:', error.message);
  // Screenshots tự động được tạo
}
```

---

**Terminal OTP Framework sẵn sàng cho production testing! 🚀**

**Ưu điểm chính:**
- ✅ **Fully Automated**: Tự động hoàn toàn sau khi nhập OTP
- ✅ **User Friendly**: Chỉ cần nhập OTP qua terminal
- ✅ **Smart Validation**: Validate OTP format và length
- ✅ **Auto-fill**: Tự động fill vào 6 input fields
- ✅ **Real-time Progress**: Monitor progress real-time
- ✅ **Error Handling**: Screenshots và detailed logs
