const BasePage = require('./BasePage');
const logger = require('../utils/logger');

class RegisterPage extends BasePage {
  constructor(browserManager) {
    super(browserManager);
    this.pageTitle = 'Đăng ký';
    this.pageUrl = process.env.APP_URL + '/register';
    
    // Define selectors for registration form elements
    this.selectors = {
      emailInput: '#email',
      passwordInput: '#password',
      confirmPasswordInput: '#confirmPassword',
      firstNameInput: '#firstName',
      lastNameInput: '#lastName',
      phoneInput: '#phone',
      dateOfBirthInput: '#dateOfBirth',
      addressInput: '#address',
      cityInput: '#city',
      postalCodeInput: '#postalCode',
      termsCheckbox: '#termsAndConditions',
      submitButton: '#registerButton',
      
      // Error messages
      emailError: '#email-error',
      passwordError: '#password-error',
      confirmPasswordError: '#confirmPassword-error',
      phoneError: '#phone-error',
      generalError: '.error-message',
      
      // Success messages
      successMessage: '.success-message',
      
      // Loading states
      loadingSpinner: '.loading-spinner',
      
      // Links
      loginLink: '#loginLink',
      
      // OTP related (if applicable)
      otpModal: '#otpModal',
      otpInput: '#otpCode',
      verifyOtpButton: '#verifyOtpButton',
      resendOtpButton: '#resendOtpButton'
    };
  }

  // Navigate to registration page
  async navigateToRegister() {
    logger.testStep('Navigating to registration page');
    await this.navigate();
    await this.waitForPageLoad();
  }

  // Fill email field
  async fillEmail(email) {
    logger.testStep(`Filling email: ${email}`);
    await this.fillInput(this.selectors.emailInput, email);
  }

  // Fill password field
  async fillPassword(password) {
    logger.testStep('Filling password');
    await this.fillInput(this.selectors.passwordInput, password);
  }

  // Fill confirm password field
  async fillConfirmPassword(password) {
    logger.testStep('Filling confirm password');
    await this.fillInput(this.selectors.confirmPasswordInput, password);
  }

  // Fill first name
  async fillFirstName(firstName) {
    logger.testStep(`Filling first name: ${firstName}`);
    await this.fillInput(this.selectors.firstNameInput, firstName);
  }

  // Fill last name
  async fillLastName(lastName) {
    logger.testStep(`Filling last name: ${lastName}`);
    await this.fillInput(this.selectors.lastNameInput, lastName);
  }

  // Fill phone number
  async fillPhone(phone) {
    logger.testStep(`Filling phone: ${phone}`);
    await this.fillInput(this.selectors.phoneInput, phone);
  }

  // Fill date of birth
  async fillDateOfBirth(date) {
    logger.testStep(`Filling date of birth: ${date}`);
    await this.fillInput(this.selectors.dateOfBirthInput, date);
  }

  // Fill address
  async fillAddress(address) {
    logger.testStep(`Filling address: ${address}`);
    await this.fillInput(this.selectors.addressInput, address);
  }

  // Fill city
  async fillCity(city) {
    logger.testStep(`Filling city: ${city}`);
    await this.fillInput(this.selectors.cityInput, city);
  }

  // Fill postal code
  async fillPostalCode(postalCode) {
    logger.testStep(`Filling postal code: ${postalCode}`);
    await this.fillInput(this.selectors.postalCodeInput, postalCode);
  }

  // Accept terms and conditions
  async acceptTermsAndConditions() {
    logger.testStep('Accepting terms and conditions');
    await this.clickElement(this.selectors.termsCheckbox);
  }

  // Submit registration form
  async submitRegistration() {
    logger.testStep('Submitting registration form');
    await this.clickElement(this.selectors.submitButton);
  }

  // Fill complete registration form
  async fillRegistrationForm(userData) {
    logger.testStep('Filling complete registration form');
    
    await this.fillEmail(userData.email);
    await this.fillPassword(userData.password);
    await this.fillConfirmPassword(userData.confirmPassword || userData.password);
    await this.fillFirstName(userData.firstName);
    await this.fillLastName(userData.lastName);
    await this.fillPhone(userData.phone);
    
    if (userData.dateOfBirth) {
      await this.fillDateOfBirth(userData.dateOfBirth);
    }
    
    if (userData.address) {
      await this.fillAddress(userData.address);
    }
    
    if (userData.city) {
      await this.fillCity(userData.city);
    }
    
    if (userData.postalCode) {
      await this.fillPostalCode(userData.postalCode);
    }
    
    await this.acceptTermsAndConditions();
  }

  // Complete registration process
  async registerUser(userData) {
    logger.testStep('Starting user registration process');
    
    await this.navigateToRegister();
    await this.fillRegistrationForm(userData);
    await this.submitRegistration();
    
    // Wait for either success or error
    try {
      await this.waitForRegistrationResult();
      logger.info('Registration completed');
    } catch (error) {
      logger.error('Registration failed', { error: error.message });
      await this.takeScreenshot('registration_failed');
      throw error;
    }
  }

  // Wait for registration result (success or error)
  async waitForRegistrationResult() {
    try {
      // Wait for either success message, error message, or OTP modal
      const result = await Promise.race([
        this.waitForElement(this.selectors.successMessage, 10000).then(() => 'success'),
        this.waitForElement(this.selectors.generalError, 10000).then(() => 'error'),
        this.waitForElement(this.selectors.otpModal, 10000).then(() => 'otp')
      ]);
      
      return result;
    } catch (error) {
      logger.error('No registration result received', { error: error.message });
      throw new Error('Registration result timeout');
    }
  }

  // Get error messages
  async getErrorMessages() {
    const errors = {};
    
    try {
      if (await this.elementExists(this.selectors.emailError)) {
        errors.email = await this.getText(this.selectors.emailError);
      }
      
      if (await this.elementExists(this.selectors.passwordError)) {
        errors.password = await this.getText(this.selectors.passwordError);
      }
      
      if (await this.elementExists(this.selectors.confirmPasswordError)) {
        errors.confirmPassword = await this.getText(this.selectors.confirmPasswordError);
      }
      
      if (await this.elementExists(this.selectors.phoneError)) {
        errors.phone = await this.getText(this.selectors.phoneError);
      }
      
      if (await this.elementExists(this.selectors.generalError)) {
        errors.general = await this.getText(this.selectors.generalError);
      }
    } catch (error) {
      logger.error('Failed to get error messages', { error: error.message });
    }
    
    return errors;
  }

  // Get success message
  async getSuccessMessage() {
    try {
      if (await this.elementExists(this.selectors.successMessage)) {
        return await this.getText(this.selectors.successMessage);
      }
      return null;
    } catch (error) {
      logger.error('Failed to get success message', { error: error.message });
      return null;
    }
  }

  // Handle OTP verification (if required)
  async verifyOTP(otpCode) {
    logger.testStep('Verifying OTP');
    
    await this.waitForElement(this.selectors.otpModal);
    await this.fillInput(this.selectors.otpInput, otpCode);
    await this.clickElement(this.selectors.verifyOtpButton);
  }

  // Resend OTP
  async resendOTP() {
    logger.testStep('Resending OTP');
    await this.clickElement(this.selectors.resendOtpButton);
  }

  // Navigate to login page
  async navigateToLogin() {
    logger.testStep('Navigating to login page');
    await this.clickElement(this.selectors.loginLink);
  }

  // Check if registration form is valid
  async isFormValid() {
    try {
      const submitButton = await this.page.$(this.selectors.submitButton);
      return await submitButton.isEnabled();
    } catch (error) {
      logger.error('Failed to check form validity', { error: error.message });
      return false;
    }
  }

  // Check if loading state is active
  async isLoading() {
    return await this.elementExists(this.selectors.loadingSpinner);
  }
}

module.exports = RegisterPage;
