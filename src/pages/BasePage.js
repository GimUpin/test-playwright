const logger = require('../utils/logger');

class BasePage {
  constructor(browserManager) {
    this.browser = browserManager;
    this.pageTitle = '';
    this.pageUrl = '';
  }

  get page() {
    return this.browser.page;
  }

  // Navigate to the page
  async navigate(url = this.pageUrl) {
    await this.browser.navigateToUrl(url);
    await this.waitForPageLoad();
  }

  // Wait for page to load completely
  async waitForPageLoad() {
    try {
      await this.page.waitForTimeout(2000);
      logger.info('Page loaded successfully');
    } catch (error) {
      logger.error('Page load timeout', { error: error.message });
      throw error;
    }
  }

  // Check if page is loaded correctly
  async isPageLoaded() {
    try {
      const title = await this.page.title();
      return title.includes(this.pageTitle);
    } catch (error) {
      logger.error('Failed to check page load status', { error: error.message });
      return false;
    }
  }

  // Get page title
  async getPageTitle() {
    try {
      return await this.page.title();
    } catch (error) {
      logger.error('Failed to get page title', { error: error.message });
      return '';
    }
  }

  // Get current URL
  async getCurrentUrl() {
    try {
      return this.page.url();
    } catch (error) {
      logger.error('Failed to get current URL', { error: error.message });
      return '';
    }
  }

  // Take screenshot
  async takeScreenshot(name) {
    return await this.browser.takeScreenshot(name);
  }

  // Wait for element to be visible
  async waitForElement(selector, timeout = 30000) {
    await this.browser.waitForElement(selector, timeout);
  }

  // Click element
  async clickElement(selector) {
    await this.browser.clickElement(selector);
  }

  // Fill input field
  async fillInput(selector, value) {
    await this.browser.fillInput(selector, value);
  }

  // Select option from dropdown
  async selectOption(selector, value) {
    try {
      await this.page.select(selector, value);
      logger.info('Option selected successfully', { selector, value });
    } catch (error) {
      logger.error('Failed to select option', { 
        selector, 
        value, 
        error: error.message 
      });
      throw error;
    }
  }

  // Get text from element
  async getText(selector) {
    return await this.browser.getText(selector);
  }

  // Check if element exists
  async elementExists(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Check if element is visible
  async isElementVisible(selector) {
    try {
      const element = await this.page.$(selector);
      if (!element) return false;
      return await element.boundingBox() !== null;
    } catch (error) {
      return false;
    }
  }

  // Check if element is enabled
  async isElementEnabled(selector) {
    try {
      const isDisabled = await this.page.$eval(selector, el => el.disabled);
      return !isDisabled;
    } catch (error) {
      return false;
    }
  }

  // Get element attribute
  async getElementAttribute(selector, attribute) {
    try {
      return await this.page.$eval(selector, (el, attr) => el.getAttribute(attr), attribute);
    } catch (error) {
      logger.error('Failed to get element attribute', { 
        selector, 
        attribute, 
        error: error.message 
      });
      return null;
    }
  }

  // Wait for element to disappear
  async waitForElementToDisappear(selector, timeout = 30000) {
    try {
      await this.page.waitForSelector(selector, { 
        hidden: true, 
        timeout 
      });
      logger.info('Element disappeared successfully', { selector });
    } catch (error) {
      logger.error('Element did not disappear', { 
        selector, 
        timeout, 
        error: error.message 
      });
      throw error;
    }
  }

  // Scroll to element
  async scrollToElement(selector) {
    try {
      await this.page.$eval(selector, el => el.scrollIntoView());
      logger.info('Scrolled to element', { selector });
    } catch (error) {
      logger.error('Failed to scroll to element', { 
        selector, 
        error: error.message 
      });
      throw error;
    }
  }

  // Wait for specific time
  async wait(milliseconds) {
    await this.page.waitForTimeout(milliseconds);
  }

  // Execute JavaScript on the page
  async executeScript(script, ...args) {
    try {
      return await this.page.evaluate(script, ...args);
    } catch (error) {
      logger.error('Failed to execute script', { 
        script, 
        error: error.message 
      });
      throw error;
    }
  }

  // Refresh the page
  async refresh() {
    try {
      await this.page.reload();
      await this.waitForPageLoad();
      logger.info('Page refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh page', { error: error.message });
      throw error;
    }
  }

  // Go back in browser history
  async goBack() {
    try {
      await this.page.goBack();
      await this.waitForPageLoad();
      logger.info('Navigated back successfully');
    } catch (error) {
      logger.error('Failed to navigate back', { error: error.message });
      throw error;
    }
  }
}

module.exports = BasePage;
