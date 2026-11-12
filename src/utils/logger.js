const winston = require('winston');
const path = require('path');
require('dotenv').config();

class Logger {
  constructor() {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const logFile = process.env.LOG_FILE || 'logs/test.log';

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'automation-test' },
      transports: [
        new winston.transports.File({ 
          filename: path.join(process.cwd(), 'logs/error.log'), 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: path.join(process.cwd(), logFile) 
        })
      ]
    });

    // Add console transport for development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  // Test specific logging methods
  testStart(testName, meta = {}) {
    this.logger.info(`Test Started: ${testName}`, {
      type: 'test_start',
      testName,
      ...meta
    });
  }

  testEnd(testName, status, duration, meta = {}) {
    this.logger.info(`Test Ended: ${testName}`, {
      type: 'test_end',
      testName,
      status,
      duration,
      ...meta
    });
  }

  testStep(stepName, meta = {}) {
    this.logger.info(`Test Step: ${stepName}`, {
      type: 'test_step',
      stepName,
      ...meta
    });
  }

  screenshot(screenshotPath, meta = {}) {
    this.logger.info(`Screenshot taken: ${screenshotPath}`, {
      type: 'screenshot',
      path: screenshotPath,
      ...meta
    });
  }
}

module.exports = new Logger();
