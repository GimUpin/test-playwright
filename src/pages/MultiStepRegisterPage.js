const BasePage = require('./BasePage');
const logger = require('../utils/logger');
const TestHelpers = require('../utils/helpers');

class MultiStepRegisterPage extends BasePage {
  constructor(browserManager) {
    super(browserManager);
    this.pageTitle = 'Đăng ký';
    this.pageUrl = process.env.APP_URL + '/register';
    
    // Define selectors cho từng bước
    this.selectors = {
      // Bước 1: Thông tin cơ bản
      step1: {
        emailInput: 'input[formcontrolname="email"]',
        firstNameInput: 'input[formcontrolname="first_name"]',
        lastNameInput: 'input[formcontrolname="last_name"]',
        phoneInput: 'input[formcontrolname="phone_number"]',
        countryCodeSelect: 'select[formcontrolname="countrycode"]',
        continueButton: 'button.btn.btn-orange',
        nextButton: '.btn-continue',
        submitStep1: 'button[type="submit"]'
      },
      
      // Bước 2: Verify Captcha (nếu có)
      captcha: {
        captchaContainer: '.captcha-container',
        captchaImage: '.captcha-image',
        captchaInput: '#captchaInput',
        refreshCaptcha: '.refresh-captcha',
        verifyCaptchaButton: '#verifyCaptcha'
      },
      
      // Bước 3: Thông tin bổ sung (nếu có)
      step2: {
        addressInput: '#address',
        cityInput: '#city',
        postalCodeInput: '#postalCode',
        dateOfBirthInput: '#dateOfBirth',
        genderSelect: '#gender',
        termsCheckbox: '#termsAndConditions',
        submitStep2: '[data-step="2"] .submit-btn'
      },

      
      // Bước 4: OTP Verification
      otp: {
        otpModal: '#otpModal',
        otpContainer: '.otp-container',
        otpInput: '#otpCode',
        otpInputs: '.otp-input', // Cho multiple input fields (6 inputs)
        verifyOtpButton: 'button[type="submit"]', // Thường là submit button
        resendOtpButton: '.resend-otp, #resendOtp',
        otpCountdown: '.otp-countdown',
        otpMessage: '.otp-message'
      },
      
      // Messages và notifications
      messages: {
        errorMessage: '.error-message',
        successMessage: '.success-message',
        validationError: '.validation-error',
        loadingSpinner: '.loading-spinner',
        redirectingMessage: '.redirecting-message'
      },
      
      // Success page
      success: {
        successContainer: '.success-container',
        welcomeMessage: '.welcome-message',
        continueToApp: '#continueToApp'
      },
      
      // Step 7: Username, Password, Confirm Password (if exists)
      step7: {
        usernameInput: 'input[formcontrolname="username"], input[name="username"], #username',
        passwordInput: 'input[formcontrolname="password"]',
        confirmPasswordInput: 'input[formcontrolname="password_confirmation"]',
        submitButton: 'button[type="submit"], .btn-submit, #submitRegistration, .btn.btn-orange'
      }
    };
  }

  // BƯỚC 1: Điền thông tin cơ bản
  async fillBasicInformation(userData) {
    logger.testStep('Filling basic information (Step 1)');
    
    try {
      // Fill email
      if (userData.email) {
        await this.fillInputIfExists(this.selectors.step1.emailInput, userData.email);
      }
      
      // Fill names
      if (userData.firstName) {
        await this.fillInputIfExists(this.selectors.step1.firstNameInput, userData.firstName);
      }
      
      if (userData.lastName) {
        await this.fillInputIfExists(this.selectors.step1.lastNameInput, userData.lastName);
      }
      
      // Fill country code (default +84 for Vietnam)
      if (userData.countryCode) {
        await this.selectOption(this.selectors.step1.countryCodeSelect, userData.countryCode);
      }
      
      // Fill phone
      if (userData.phone) {
        await this.fillInputIfExists(this.selectors.step1.phoneInput, userData.phone);
      }
      
      logger.info('Basic information filled successfully');
    } catch (error) {
      logger.error('Failed to fill basic information', { error: error.message });
      throw error;
    }
  }

  // Click button "Tiếp tục"
  async clickContinueButton() {
    logger.testStep('Clicking continue button');
    
    try {
      // Thử nhiều selector có thể có cho button continue
      const continueSelectors = [
        this.selectors.step1.continueButton,
        this.selectors.step1.nextButton,
        this.selectors.step1.submitStep1,
        'button[type="submit"]',
        '.btn-continue',
        '.continue-btn',
        '#next-step'
      ];
      
      let clicked = false;
      for (const selector of continueSelectors) {
        if (await this.elementExists(selector)) {
          await this.clickElement(selector);
          clicked = true;
          logger.info('Continue button clicked', { selector });
          break;
        }
      }
      
      if (!clicked) {
        throw new Error('Continue button not found');
      }
      
      // Đợi một chút để page load
      await this.wait(2000);
      
    } catch (error) {
      logger.error('Failed to click continue button', { error: error.message });
      await this.takeScreenshot('continue_button_error');
      throw error;
    }
  }

  // BƯỚC 2: Xử lý Captcha nếu có
  async handleCaptchaIfExists(captchaText = null) {
    logger.testStep('Checking for captcha verification');
    
    try {
      // Kiểm tra xem có captcha không
      const hasCaptcha = await this.elementExists(this.selectors.captcha.captchaContainer) ||
                        await this.elementExists(this.selectors.captcha.captchaImage);
      
      if (!hasCaptcha) {
        logger.info('No captcha found, skipping captcha verification');
        return true;
      }
      
      logger.info('Captcha detected, attempting to handle');
      
      if (captchaText) {
        // Nếu có captcha text được cung cấp
        await this.fillInputIfExists(this.selectors.captcha.captchaInput, captchaText);
        await this.clickElementIfExists(this.selectors.captcha.verifyCaptchaButton);
        
        // Đợi kết quả verification
        await this.wait(3000);
        
        // Kiểm tra xem captcha có pass không
        const captchaError = await this.elementExists('.captcha-error') ||
                            await this.elementExists('.invalid-captcha');
        
        if (captchaError) {
          logger.warn('Captcha verification failed');
          return false;
        }
        
        logger.info('Captcha verified successfully');
        return true;
        
      } else {
        // Nếu không có captcha text, chờ manual input hoặc skip
        logger.warn('Captcha detected but no captcha text provided');
        logger.info('You may need to manually solve the captcha or provide captcha text');
        
        // Đợi một thời gian để user có thể solve manual
        await this.wait(10000);
        return true;
      }
      
    } catch (error) {
      logger.error('Failed to handle captcha', { error: error.message });
      await this.takeScreenshot('captcha_error');
      return false;
    }
  }

  // BƯỚC 3: Đợi redirect và validation
  async waitForValidationAndRedirect(timeoutMs = 200) {
    logger.testStep('Waiting for validation and potential redirect');
    
    try {
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeoutMs) {
        // Kiểm tra error messages
        const hasError = await this.elementExists(this.selectors.messages.errorMessage) ||
                         await this.elementExists(this.selectors.messages.validationError);
        
        if (hasError) {
          const errorMessage = await this.getErrorMessage();
          logger.error('Validation failed', { errorMessage });
          return { success: false, type: 'validation_error', message: errorMessage };
        }
        
        // Kiểm tra loading state
        const isLoading = await this.elementExists(this.selectors.messages.loadingSpinner);
        if (isLoading) {
          logger.info('Validation in progress...');
          await this.wait(1000);
          continue;
        }
        
        // Kiểm tra redirect message
        const hasRedirectMessage = await this.elementExists(this.selectors.messages.redirectingMessage);
        if (hasRedirectMessage) {
          logger.info('Redirecting to next step...');
          await this.wait(2000);
        }
        
        // Kiểm tra xem có redirect đến trang mới không (URL change)
        const currentUrl = await this.getCurrentUrl();
        if (!currentUrl.includes('/register') || currentUrl.includes('step-2') || currentUrl.includes('verify')) {
          logger.info('Redirected to new page', { newUrl: currentUrl });
          return { success: true, type: 'redirect', url: currentUrl };
        }
        
        // Kiểm tra OTP modal đã xuất hiện chưa
        const hasOtpModal = await this.elementExists(this.selectors.otp.otpModal) ||
                           await this.elementExists(this.selectors.otp.otpContainer);
        
        if (hasOtpModal) {
          logger.info('OTP verification step appeared');
          return { success: true, type: 'otp_step' };
        }
        
        // await this.wait(500);
      }
      
      // Timeout - kiểm tra trạng thái cuối
      logger.warn('Validation timeout, checking final state');
      return { success: false, type: 'timeout' };
      
    } catch (error) {
      logger.error('Error during validation wait', { error: error.message });
      await this.takeScreenshot('validation_wait_error');
      return { success: false, type: 'error', message: error.message };
    }
  }

  // BƯỚC 4: Đợi email OTP
  async waitForOtpEmail(timeoutMs = 5000) {
    logger.testStep('Waiting for OTP email to be sent');
    
    try {
      // Kiểm tra OTP container có xuất hiện không
      const otpContainerAppeared = await this.waitForElementWithTimeout(
        this.selectors.otp.otpContainer, 
        timeoutMs
      );
      
      if (!otpContainerAppeared) {
        // Thử selector khác
        const otpModalAppeared = await this.waitForElementWithTimeout(
          this.selectors.otp.otpModal, 
          5000
        );
        
        if (!otpModalAppeared) {
          throw new Error('OTP container/modal not found');
        }
      }
      
      // Kiểm tra message về việc gửi email
      const otpMessage = await this.getOtpMessage();
      logger.info('OTP step ready', { message: otpMessage });
      
      return { success: true, message: otpMessage };
      
    } catch (error) {
      logger.error('Failed to wait for OTP email', { error: error.message });
      await this.takeScreenshot('otp_wait_error');
      return { success: false, error: error.message };
    }
  }

  // BƯỚC 5: Nhập OTP
  async enterOtpCode(otpCode) {
    logger.testStep(`Entering OTP code: ${otpCode}`);
    
    try {
      // Kiểm tra xem có multiple input fields cho OTP không
      const multipleOtpInputs = await this.page.$$(this.selectors.otp.otpInputs);
      
      if (multipleOtpInputs && multipleOtpInputs.length > 0) {
        // Trường hợp có nhiều input field (mỗi số một field)
        logger.info(`Multiple OTP input fields detected: ${multipleOtpInputs.length} fields`);
        
        // Clear tất cả input fields trước
        for (let i = 0; i < multipleOtpInputs.length; i++) {
          await multipleOtpInputs[i].click();
          await multipleOtpInputs[i].evaluate(el => el.value = '');
        }
        
        // Fill từng ký tự vào từng field
        for (let i = 0; i < Math.min(otpCode.length, multipleOtpInputs.length); i++) {
          await multipleOtpInputs[i].click();
          await multipleOtpInputs[i].type(otpCode[i]);
          await this.wait(100); // Delay nhỏ giữa các ký tự
          
          logger.info(`Filled OTP digit ${i + 1}: ${otpCode[i]}`);
        }
        
        logger.info(`OTP code filled into ${multipleOtpInputs.length} input fields`);
        
      } else {
        // Trường hợp single input field
        logger.info('Single OTP input field detected');
        await this.fillInputIfExists(this.selectors.otp.otpInput, otpCode);
      }
      
      logger.info('OTP code entered successfully');
      
    } catch (error) {
      logger.error('Failed to enter OTP code', { error: error.message });
      await this.takeScreenshot('otp_entry_error');
      throw error;
    }
  }

  // BƯỚC 6: Verify OTP
  async verifyOtp() {
    logger.testStep('Verifying OTP code');
    
    try {
      
      // Kiểm tra kết quả - cải thiện error detection
      const errorSelectors = [
        '.otp-error',
        '.invalid-otp',
        '.alert-danger',
        '.text-danger',
        'p[style*="color: #D92D20"]', // Specific error style from user's HTML
        '.mt-2.text-center.fw-700[style*="color: #D92D20"]'
      ];
      
      let hasError = false;
      let errorMessage = '';
      
      for (const selector of errorSelectors) {
        const exists = await this.elementExists(selector);
        if (exists) {
          hasError = true;
          errorMessage = await this.getText(selector);
          logger.error('OTP verification failed', { errorMessage, selector });
          break;
        }
      }
      
      if (hasError) {
        return { success: false, message: errorMessage };
      }
      
      
      // Kiểm tra URL redirect (success)
      const currentUrl = await this.getCurrentUrl();
      if (currentUrl.includes('success') || 
          currentUrl.includes('complete') || 
          currentUrl.includes('welcome') ||
          currentUrl.includes('dashboard')) {
        logger.info('OTP verified successfully - redirected to success page', { url: currentUrl });
        return { success: true, url: currentUrl };
      }
      
      // Không đợi thêm - kiểm tra nhanh
      // Nếu không có error ngay lập tức, coi như success
      logger.info('OTP verification completed without immediate errors');
      return { success: true };
      
    } catch (error) {
      logger.error('Failed to verify OTP', { error: error.message });
      await this.takeScreenshot('otp_verify_error');
      return { success: false, error: error.message };
    }
  }

  // BƯỚC OTP: Đợi tester nhập OTP qua terminal
  async waitForTerminalOtpEntry(timeoutMs = 300000) { // Default 5 minutes
    logger.testStep('Waiting for OTP input via terminal');
    
    try {
      // Kiểm tra OTP container có xuất hiện không
      const otpContainerExists = await this.elementExists(this.selectors.otp.otpContainer) ||
                                await this.elementExists(this.selectors.otp.otpModal) ||
                                await this.elementExists(this.selectors.otp.otpInputs) ||
                                await this.page.$$(this.selectors.otp.otpInputs).then(inputs => inputs.length > 0);
      
      if (!otpContainerExists) {
        logger.info('OTP container not found, checking current URL for OTP page...');
        const currentUrl = await this.getCurrentUrl();
        if (!currentUrl.includes('verify') && !currentUrl.includes('otp')) {
          logger.warn('Not on OTP verification page, may need to wait for redirect');
          await this.wait(5000);
        }
      }
      
      console.log('\n🔑 ================= TERMINAL OTP ENTRY =================');
      console.log('📧 Please check your email for the OTP code');
      console.log('⌨️  Enter the OTP code in the terminal below:');
      console.log('🕐 You have up to', Math.round(timeoutMs / 60000), 'minutes to complete this');
      console.log('✅ The test will continue automatically after OTP verification');
      console.log('======================================================\n');
      
      logger.info('Terminal OTP entry instructions displayed', { 
        timeout: timeoutMs,
        currentUrl: await this.getCurrentUrl()
      });
      
      // Sử dụng readline để nhập OTP từ terminal
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const otpCode = await new Promise((resolve) => {
        rl.question('🔐 Enter OTP code (6 digits): ', (answer) => {
          rl.close();
          resolve(answer.trim());
        });
      });
      
      if (!otpCode || otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
        throw new Error('Invalid OTP code. Must be exactly 6 digits.');
      }
      
      console.log('✅ OTP code received:', otpCode);
      logger.info('OTP code received from terminal', { otpCode: '******' });
      
      // Tự động fill OTP vào form
      await this.enterOtpCode(otpCode);
      console.log('✅ OTP code filled automatically');
      
      // Verify OTP
      const otpResult = await this.verifyOtp();
      if (otpResult.success) {
        console.log('✅ OTP verification successful!');
        
        // Đợi redirect sang màn hình username/password (giảm từ 3s xuống 1.5s)
        console.log('⏳ Waiting for redirect to username/password page...');
        await this.wait(1500);
        
        // Kiểm tra xem có redirect không
        const currentUrl = await this.getCurrentUrl();
        console.log('📍 Current URL after OTP:', currentUrl);
        
        // Kiểm tra xem có password fields xuất hiện không
        const hasPasswordFields = await this.elementExists(this.selectors.step7.passwordInput) ||
                                 await this.elementExists(this.selectors.step7.confirmPasswordInput);
        
        if (hasPasswordFields) {
          console.log('✅ Redirected to username/password page');
          return { success: true, otpCode: '******', redirected: true, hasPasswordFields: true };
        } else {
          console.log('⚠️  OTP verified but no redirect detected');
          return { success: true, otpCode: '******', redirected: false };
        }
        
      } else {
        console.log(`❌ OTP verification failed: ${otpResult.message}`);
        console.log('🔄 This might be due to expired OTP or incorrect code');
        console.log('💡 You can try again with a fresh OTP code');
        
        // Return failure but don't throw - let the framework handle it
        return { success: false, message: otpResult.message };
      }
      
    } catch (error) {
      logger.error('Error during terminal OTP entry', { error: error.message });
      console.log('\n❌ Error during terminal OTP entry:', error.message);
      return { success: false, error: error.message };
    }
  }

  // BƯỚC OTP: Đợi tester nhập OTP manually trong browser
  async waitForManualOtpEntry(timeoutMs = 300000) { // Default 5 minutes
    logger.testStep('Waiting for manual OTP entry by tester');
    
    try {
      // Kiểm tra OTP container có xuất hiện không
      const otpContainerExists = await this.elementExists(this.selectors.otp.otpContainer) ||
                                await this.elementExists(this.selectors.otp.otpModal) ||
                                await this.elementExists(this.selectors.otp.otpInput);
      
      if (!otpContainerExists) {
        logger.info('OTP container not found, checking current URL for OTP page...');
        const currentUrl = await this.getCurrentUrl();
        if (!currentUrl.includes('verify') && !currentUrl.includes('otp')) {
          logger.warn('Not on OTP verification page, may need to wait for redirect');
          await this.wait(5000);
        }
      }
      
      console.log('\n🔑 ================= MANUAL OTP ENTRY =================');
      console.log('📧 Please check your email for the OTP code');
      console.log('⌨️  Enter the OTP code in the browser manually');
      console.log('🕐 You have up to', Math.round(timeoutMs / 60000), 'minutes to complete this');
      console.log('✅ The test will continue automatically after OTP verification');
      console.log('======================================================\n');
      
      logger.info('Manual OTP entry instructions displayed', { 
        timeout: timeoutMs,
        currentUrl: await this.getCurrentUrl()
      });
      
      const startTime = Date.now();
      let lastUrl = await this.getCurrentUrl();
      
      // Đợi cho đến khi:
      // 1. URL thay đổi (redirect sau OTP success)
      // 2. Xuất hiện success message
      // 3. Timeout
      while (Date.now() - startTime < timeoutMs) {
        
        const currentUrl = await this.getCurrentUrl();
        
        // Kiểm tra URL redirect (success)
        if (currentUrl !== lastUrl) {
          logger.info('URL changed, checking if OTP verification was successful', {
            oldUrl: lastUrl,
            newUrl: currentUrl
          });
          
          // Kiểm tra xem có phải là success page không
          if (currentUrl.includes('success') || 
              currentUrl.includes('complete') || 
              currentUrl.includes('welcome') ||
              currentUrl.includes('dashboard')) {
            
            console.log('\n✅ OTP verification successful! URL redirected to:', currentUrl);
            logger.info('Manual OTP entry completed successfully', { finalUrl: currentUrl });
            return { success: true, finalUrl: currentUrl };
          }
          
          // Nếu redirect nhưng không phải success page, cập nhật lastUrl
          lastUrl = currentUrl;
        }
        
        // Kiểm tra success messages
        const hasSuccessMessage = await this.elementExists(this.selectors.success.successContainer) ||
                                 await this.elementExists(this.selectors.messages.successMessage) ||
                                 await this.elementExists('.success') ||
                                 await this.elementExists('.registration-complete');
        
        if (hasSuccessMessage) {
          const successMessage = await this.getSuccessMessage();
          console.log('\n✅ OTP verification successful! Success message detected:', successMessage);
          logger.info('Manual OTP entry completed successfully', { successMessage });
          return { success: true, message: successMessage };
        }
        
        // Kiểm tra error messages
        const hasErrorMessage = await this.elementExists('.otp-error') ||
                               await this.elementExists('.error') ||
                               await this.elementExists('.alert-danger');
        
        if (hasErrorMessage) {
          const errorMessage = await this.getText('.otp-error, .error, .alert-danger');
          logger.warn('OTP error detected, but continuing to wait for manual retry', { errorMessage });
          console.log('\n⚠️  OTP Error detected:', errorMessage);
          console.log('📝 Please try entering the OTP again...');
        }
        
        // Log progress every 30 seconds
        const elapsed = Date.now() - startTime;
        if (elapsed % 30000 < 2000) {
          const remaining = Math.round((timeoutMs - elapsed) / 1000);
          console.log(`⏱️  Still waiting for manual OTP entry... (${remaining}s remaining)`);
        }
      }
      
      // Timeout reached
      console.log('\n⏰ Manual OTP entry timeout reached');
      logger.error('Manual OTP entry timeout', { timeoutMs, elapsedMs: Date.now() - startTime });
      return { 
        success: false, 
        message: 'Manual OTP entry timeout reached',
        timeoutMs,
        finalUrl: await this.getCurrentUrl()
      };
      
    } catch (error) {
      logger.error('Error during manual OTP entry wait', { error: error.message });
      console.log('\n❌ Error during manual OTP entry:', error.message);
      return { success: false, error: error.message };
    }
  }

  //BƯỚC 7: Điền username, password, confirm password (nếu có)
  async fillUsernamePassword(username, password, confirmPassword) {
    logger.testStep('Filling username, password, and confirm password (if exists)');
    
    try {
      // Kiểm tra xem step 7 có tồn tại không
      const hasStep7 = await this.elementExists(this.selectors.step7.usernameInput) ||
                      await this.elementExists(this.selectors.step7.passwordInput) ||
                      await this.elementExists(this.selectors.step7.confirmPasswordInput);
      
      if (!hasStep7) {
        logger.info('Step 7 (username/password) not found - skipping this step');
        return { success: true, skipped: true, reason: 'Step 7 fields not found' };
      }
      
      let fieldsFilled = 0;
      
      // Fill username nếu có
      if (username && await this.elementExists(this.selectors.step7.usernameInput)) {
        await this.fillInputIfExists(this.selectors.step7.usernameInput, username);
        logger.info('Username filled successfully');
        fieldsFilled++;
      }
      
      const passwordToUse = this.generateStrongPassword();
      
      // Fill password nếu có
      if (password && await this.elementExists(this.selectors.step7.passwordInput)) {
        await this.fillInputIfExists(this.selectors.step7.passwordInput, password);
        passwordToUse = password;
        logger.info('Password filled successfully with provided value');
        fieldsFilled++;
      } else if (await this.elementExists(this.selectors.step7.passwordInput)) {
        // Nếu không có password được cung cấp, generate một password mạnh
        logger.info('Generated password for password field', { generatedPassword: '******' });
        await this.fillInputIfExists(this.selectors.step7.passwordInput, passwordToUse);
        logger.info('Generated password filled successfully', { password: '******' });
        fieldsFilled++;
      }
      
      // Fill confirm password nếu có
      if (confirmPassword && await this.elementExists(this.selectors.step7.confirmPasswordInput)) {
        await this.fillInputIfExists(this.selectors.step7.confirmPasswordInput, confirmPassword);
        logger.info('Confirm password filled successfully with provided value');
        fieldsFilled++;
      } else if (await this.elementExists(this.selectors.step7.confirmPasswordInput)) {
        // Nếu không có confirm password, sử dụng password đã nhập ở trên
        if (passwordToUse) {
          logger.info('Filling confirm password with value from password field', { 
            passwordToUse: passwordToUse ? '******' : 'null',
            confirmPasswordSelector: this.selectors.step7.confirmPasswordInput
          });
          await this.fillInputIfExists(this.selectors.step7.confirmPasswordInput, passwordToUse);
          logger.info('Confirm password filled with matching value from password field');
        } else {
          logger.info('Using fallback password for confirm password field', { passwordToUse: '******' });
          await this.fillInputIfExists(this.selectors.step7.confirmPasswordInput, passwordToUse);
          logger.info('Confirm password filled with fallback value');
        }
        fieldsFilled++;
      }
      
      if (fieldsFilled > 0) {
        logger.info(`Step 7 completed - ${fieldsFilled} fields filled`);
        return { success: true, completed: true, fieldsFilled };
      } else {
        logger.info('Step 7 - no fields were filled');
        return { success: true, completed: false, reason: 'No fields available to fill' };
      }
      
    } catch (error) {
      logger.error('Failed to fill username, password, and confirm password', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  // BƯỚC 8: Kiểm tra đăng ký thành công
  async checkRegistrationSuccess() {
    logger.testStep('Checking registration success');
    
    try {
      // Đợi page load hoàn toàn
      await this.wait(5000);
      
      // Kiểm tra URL hiện tại
      const currentUrl = await this.getCurrentUrl();
      logger.info('Checking registration success at URL', { currentUrl });
      
      // Kiểm tra URL redirect (success indicators)
      if (currentUrl.includes('success') || 
          currentUrl.includes('welcome') || 
          currentUrl.includes('dashboard') ||
          currentUrl.includes('complete') ||
          currentUrl.includes('verified') ||
          currentUrl.includes('account')) {
        logger.info('Registration success - redirected to success page', { url: currentUrl });
        return { success: true, url: currentUrl, type: 'url_redirect' };
      }
      
      // Đợi success container hoặc redirect với timeout dài hơn
      const successStates = [
        this.selectors.success.successContainer,
        this.selectors.success.welcomeMessage,
        this.selectors.messages.successMessage,
        '.registration-complete',
        '.welcome-page',
        '.success-message',
        '.alert-success',
        '.text-success',
        '.verification-success',
        '.account-verified'
      ];
      
      // Đợi tối đa 30 giây để success state xuất hiện
      const maxWaitTime = 30000;
      const startTime = Date.now();
      
      while (Date.now() - startTime < maxWaitTime) {
        for (const selector of successStates) {
          const exists = await this.elementExists(selector);
          if (exists) {
            const successMessage = await this.getText(selector);
            logger.info('Registration completed successfully', { successMessage, selector });
            return { success: true, message: successMessage, type: 'success_element' };
          }
        }
        
        // Kiểm tra URL có thay đổi không
        const newUrl = await this.getCurrentUrl();
        if (newUrl !== currentUrl) {
          if (newUrl.includes('success') || 
              newUrl.includes('welcome') || 
              newUrl.includes('dashboard') ||
              newUrl.includes('complete') ||
              newUrl.includes('verified') ||
              newUrl.includes('account')) {
            logger.info('Registration success - URL changed to success page', { 
              oldUrl: currentUrl, 
              newUrl: newUrl 
            });
            return { success: true, url: newUrl, type: 'url_change' };
          }
        }
        
        // Đợi 2 giây trước khi kiểm tra lại
        await this.wait(2000);
      }
      
      // Nếu không tìm thấy success state, kiểm tra xem có đang ở password page không
      const hasPasswordFields = await this.elementExists(this.selectors.step7.passwordInput) ||
                               await this.elementExists(this.selectors.step7.confirmPasswordInput);
      
      if (hasPasswordFields) {
        logger.info('Currently on password page - waiting for user to complete registration');
        return { success: false, message: 'On password page - registration not yet complete', currentStep: 'password_page' };
      }
      
      // Nếu không tìm thấy success state, log thông tin để debug
      logger.warn('Success state not detected after timeout', { 
        currentUrl,
        maxWaitTime,
        pageTitle: await this.getPageTitle(),
        hasPasswordFields
      });
      
      // Chụp screenshot để debug
      await this.takeScreenshot('success_check_timeout');
      
      return { success: false, message: 'Success state not detected after timeout' };
      
    } catch (error) {
      logger.error('Failed to check registration success', { error: error.message });
      await this.takeScreenshot('success_check_error');
      return { success: false, error: error.message };
    }
  }

  // LUỒNG CHÍNH: Chạy toàn bộ quá trình đăng ký
  async completeRegistrationFlow(userData, options = {}) {
    logger.testStart('Complete Multi-Step Registration Flow');
    
    const flowOptions = {
      captchaText: options.captchaText || null,
      otpCode: options.otpCode || null,
      waitForOtpEmail: options.waitForOtpEmail !== false,
      skipCaptcha: options.skipCaptcha || false,
      ...options
    };
    
    try {
      // Bước 1: Navigate và fill thông tin cơ bản
      await this.navigate();
      await this.fillBasicInformation(userData);
      await this.clickContinueButton();
      
      // Bước 2: Xử lý Captcha nếu có
      if (!flowOptions.skipCaptcha) {
        const captchaResult = await this.handleCaptchaIfExists(flowOptions.captchaText);
        if (!captchaResult) {
          throw new Error('Captcha verification failed');
        }
      }
      
      // Bước 3: Đợi validation và redirect
      const validationResult = await this.waitForValidationAndRedirect();
      if (!validationResult.success) {
        throw new Error(`Validation failed: ${validationResult.message}`);
      }
      
      // Bước 4: Đợi OTP email nếu cần
      if (flowOptions.waitForOtpEmail) {
        const otpEmailResult = await this.waitForOtpEmail();
        if (!otpEmailResult.success) {
          throw new Error(`OTP email wait failed: ${otpEmailResult.error}`);
        }
      }
      
      // Bước 5 & 6: Xử lý OTP
      if (flowOptions.otpCode) {
        // Tự động nhập OTP nếu được cung cấp
        await this.enterOtpCode(flowOptions.otpCode);
        const otpResult = await this.verifyOtp();
        if (!otpResult.success) {
          throw new Error(`OTP verification failed: ${otpResult.message}`);
        }
      } else if (flowOptions.waitForTerminalOtp) {
        // Đợi tester nhập OTP qua terminal
        logger.info('Waiting for OTP input via terminal...');
        const terminalOtpResult = await this.waitForTerminalOtpEntry(flowOptions.terminalOtpTimeout);
        if (!terminalOtpResult.success) {
          throw new Error(`Terminal OTP entry failed: ${terminalOtpResult.message}`);
        }
        
        // Kiểm tra xem có redirect sau OTP không
        if (terminalOtpResult.redirected && terminalOtpResult.hasPasswordFields) {
          logger.info('OTP verification successful and redirected to password page');
        }
      } else if (flowOptions.waitForManualOtp !== false) {
        // Đợi tester nhập OTP manually trong browser
        logger.info('Waiting for manual OTP entry by tester...');
        const manualOtpResult = await this.waitForManualOtpEntry(flowOptions.manualOtpTimeout);
        if (!manualOtpResult.success) {
          throw new Error(`Manual OTP entry failed: ${manualOtpResult.message}`);
        }
      } else {
        logger.warn('No OTP handling configured - skipping OTP step');
      }
      
      //Bước 7: Điền username, password, confirm password (nếu có)
      const step7Result = await this.fillUsernamePassword(
        userData.username || null, 
        userData.password || null, 
        userData.confirmPassword || null
      );
      
      // Chỉ click continue nếu step 7 được thực hiện
      if (step7Result.completed) {
        await this.clickContinueButton();
      } else {
        logger.info('Step 7 skipped, proceeding to success check');
      }
      
      // Bước 8: Kiểm tra thành công
      const successResult = await this.checkRegistrationSuccess();
      
      logger.testEnd('Complete Multi-Step Registration Flow', 
        successResult.success ? 'passed' : 'failed', Date.now());
      
      return successResult;
      
    } catch (error) {
      logger.error('Registration flow failed', { error: error.message });
      await this.takeScreenshot('registration_flow_error');
      throw error;
    }
  }

  // UTILITY METHODS
  
  // Generate strong password for testing
  generateStrongPassword() {
    const password = 'Test123!@#';
    this.lastGeneratedPassword = password;
    logger.info('Generated strong password', { password: '******', length: password.length });
    return password;
  }
  
  async fillInputIfExists(selector, value) {
    if (await this.elementExists(selector)) {
      await this.fillInput(selector, value);
      return true;
    }
    return false;
  }
  
  async clickElementIfExists(selector) {
    if (await this.elementExists(selector)) {
      await this.clickElement(selector);
      return true;
    }
    return false;
  }
  
  async waitForElementWithTimeout(selector, timeout) {
    try {
      await this.waitForElement(selector, timeout);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  async getErrorMessage() {
    const errorSelectors = [
      this.selectors.messages.errorMessage,
      this.selectors.messages.validationError,
      '.error',
      '.alert-danger'
    ];
    
    for (const selector of errorSelectors) {
      if (await this.elementExists(selector)) {
        return await this.getText(selector);
      }
    }
    
    return 'Unknown error';
  }
  
  async getOtpMessage() {
    const messageSelectors = [
      this.selectors.otp.otpMessage,
      '.otp-info',
      '.verification-message'
    ];
    
    for (const selector of messageSelectors) {
      if (await this.elementExists(selector)) {
        return await this.getText(selector);
      }
    }
    
    return 'OTP verification step';
  }
}

module.exports = MultiStepRegisterPage;
