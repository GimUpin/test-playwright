require('dotenv').config();

// Polyfill for Promise.allSettled in Node.js v14
// if (!Promise.allSettled) {
//   Promise.allSettled = function(promises) {
//     return Promise.all(
//       promises.map(promise =>
//         Promise.resolve(promise).then(
//           value => ({ status: 'fulfilled', value }),
//           reason => ({ status: 'rejected', reason })
//         )
//       )
//     );
//   };
// }

class PuppeteerConfig {
  static getConfig() {
    const isHeadless = process.env.HEADLESS === 'true';
    const slowMo = parseInt(process.env.SLOW_MO) || 0;
    const width = parseInt(process.env.BROWSER_WIDTH) || 1920;
    const height = parseInt(process.env.BROWSER_HEIGHT) || 1080;

    return {
      headless: isHeadless ? 'new' : false,
      slowMo: slowMo,
      args: [
        // '--no-sandbox',
        // '--disable-setuid-sandbox',
        // '--disable-dev-shm-usage',
        // '--disable-web-security',
        // '--disable-features=VizDisplayCompositor',
        `--window-size=${width},${height}`,
        // '--disable-extensions',
        // '--disable-plugins',
        // '--disable-images',
        // '--disable-javascript',
        // '--disable-css',
        // '--disable-gpu',
        // Fix for Node.js v14 compatibility - block external scripts that use Promise.allSettled
        // '--disable-background-timer-throttling',
        // '--disable-backgrounding-occluded-windows',
        // '--disable-renderer-backgrounding',
        // '--disable-features=TranslateUI',
        // '--disable-ipc-flooding-protection',
        // '--disable-features=ScriptStreaming',
        // '--disable-features=WebRtcHideLocalIpsWithMdns'
      ],
      defaultViewport: {
        width: width,
        height: height
      },
      ignoreHTTPSErrors: true,
      // ignoreDefaultArgs: ['--disable-extensions'],
      timeout: parseInt(process.env.TEST_TIMEOUT) || 30000
    };
  }

  static getDefaultOptions() {
    return {
      waitUntil: 'networkidle2',
      timeout: parseInt(process.env.TEST_TIMEOUT) || 30000
    };
  }

  static getScreenshotConfig() {
    return {
      path: null, // Will be set dynamically
      type: 'png',
      fullPage: true,
      quality: 90
    };
  }

  static getVideoConfig() {
    return {
      dir: './logs/videos',
      fps: 25,
      ffmpeg_Path: null
    };
  }
}

module.exports = PuppeteerConfig;
