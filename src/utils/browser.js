const puppeteer = require('puppeteer');
const PuppeteerConfig = require('../config/puppeteer');
const logger = require('./logger');
const path = require('path');
const fs = require('fs');

class BrowserManager {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotCounter = 0;
  }

  async launchBrowser() {
    try {
      const config = PuppeteerConfig.getConfig();
      this.browser = await puppeteer.launch(config);
      logger.info('Browser launched successfully', { config });
      return this.browser;
    } catch (error) {
      logger.error('Failed to launch browser', { error: error.message });
      throw error;
    }
  }

  async createPage() {
    try {
      if (!this.browser) {
        await this.launchBrowser();
      }
      
      this.page = await this.browser.newPage();
      
      // Set viewport
      const viewport = PuppeteerConfig.getConfig().defaultViewport;
      await this.page.setViewport(viewport);
      
      // Set user agent
      await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Enable request interception for performance optimization and blocking problematic scripts
      await this.page.setRequestInterception(true);
      this.page.on('request', (req) => {
        const url = req.url();
        
        // Block Facebook tracking scripts that cause Promise.allSettled errors
        if (url.includes('facebook.net') || url.includes('connect.facebook.net')) {
          req.abort();
          logger.debug('Blocked Facebook tracking script', { url });
          return;
        }
        
        // Block other problematic external scripts
        if (url.includes('google-analytics.com') || url.includes('googletagmanager.com')) {
          req.abort();
          logger.debug('Blocked analytics script', { url });
          return;
        }
        
        // Block stylesheets and images for performance
        if (req.resourceType() === 'stylesheet' || req.resourceType() === 'image') {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Add console and error listeners
      this.page.on('console', msg => {
        logger.debug(`Console ${msg.type()}: ${msg.text()}`);
      });

      this.page.on('pageerror', error => {
        logger.error(`Page error: ${error.message}`);
      });

      logger.info('New page created successfully');
      return this.page;
    } catch (error) {
      logger.error('Failed to create page', { error: error.message });
      throw error;
    }
  }

  async navigateToUrl(url, options = {}) {
    try {
      if (!this.page) {
        await this.createPage();
      }

      const defaultOptions = PuppeteerConfig.getDefaultOptions();
      const navigationOptions = { ...defaultOptions, ...options };

      logger.testStep(`Navigating to: ${url}`);
      await this.page.goto(url, navigationOptions);
      
      // Wait for page to be fully loaded  
      await this.page.waitForTimeout(2000);
      
      logger.info('Navigation completed successfully', { url });
    } catch (error) {
      logger.error('Navigation failed', { url, error: error.message });
      await this.takeScreenshot('navigation_error');
      throw error;
    }
  }

  async takeScreenshot(name = null, fullPage = true) {
    try {
      if (!this.page) {
        throw new Error('No page available for screenshot');
      }

      // Create screenshots directory if it doesn't exist
      const screenshotDir = path.join(process.cwd(), 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = name ? 
        `${name}_${timestamp}.png` : 
        `screenshot_${++this.screenshotCounter}_${timestamp}.png`;
      
      const screenshotPath = path.join(screenshotDir, filename);
      
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: fullPage,
        type: 'png'
      });

      logger.screenshot(screenshotPath);
      return screenshotPath;
    } catch (error) {
      logger.error('Failed to take screenshot', { error: error.message });
      throw error;
    }
  }

  async waitForElement(selector, timeout = 30000) {
    try {
      logger.testStep(`Waiting for element: ${selector}`);
      await this.page.waitForSelector(selector, { timeout });
      logger.info('Element found', { selector });
    } catch (error) {
      logger.error('Element not found', { selector, timeout, error: error.message });
      await this.takeScreenshot('element_not_found');
      throw error;
    }
  }

  async clickElement(selector) {
    try {
      await this.waitForElement(selector);
      logger.testStep(`Clicking element: ${selector}`);
      await this.page.click(selector);
      await this.page.waitForTimeout(500); // Small delay after click
      logger.info('Element clicked successfully', { selector });
    } catch (error) {
      logger.error('Failed to click element', { selector, error: error.message });
      await this.takeScreenshot('click_error');
      throw error;
    }
  }

  async fillInput(selector, value) {
    try {
      await this.waitForElement(selector);
      logger.testStep(`Filling input: ${selector} with value: ${value}`);
      await this.page.focus(selector);
      await this.page.evaluate((sel) => {
        const input = document.querySelector(sel);
        if (input) input.value = '';
      }, selector);
      await this.page.type(selector, value);
      logger.info('Input filled successfully', { selector });
    } catch (error) {
      logger.error('Failed to fill input', { selector, error: error.message });
      await this.takeScreenshot('fill_error');
      throw error;
    }
  }

  async getText(selector) {
    try {
      await this.waitForElement(selector);
      const text = await this.page.$eval(selector, el => el.textContent);
      logger.info('Text retrieved', { selector, text });
      return text;
    } catch (error) {
      logger.error('Failed to get text', { selector, error: error.message });
      throw error;
    }
  }

  async closeBrowser() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        logger.info('Browser closed successfully');
      }
    } catch (error) {
      logger.error('Failed to close browser', { error: error.message });
    }
  }

  async closeCurrentPage() {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
        logger.info('Current page closed successfully');
      }
    } catch (error) {
      logger.error('Failed to close page', { error: error.message });
    }
  }
}

module.exports = BrowserManager;
