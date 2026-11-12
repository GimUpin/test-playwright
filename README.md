# Register Automation Test

Dự án automation testing cho luồng đăng ký sử dụng Node.js, Puppeteer, PostgreSQL và Redis.

## 🚀 Tính năng

- **Automation Testing**: Test tự động giao diện luồng đăng ký
- **Puppeteer Integration**: Sử dụng Puppeteer 22.15.0 cho browser automation
- **Database Support**: Tích hợp PostgreSQL để test các tương tác database
- **Redis Caching**: Hỗ trợ Redis cho session management và caching
- **Page Object Model**: Cấu trúc code theo mô hình Page Object
- **Comprehensive Logging**: Ghi log chi tiết với Winston
- **Test Utilities**: Bộ utilities mạnh mẽ cho việc tạo test data
- **Screenshot Support**: Tự động chụp screenshot khi có lỗi
- **Environment Configuration**: Cấu hình môi trường linh hoạt

## 📋 Yêu cầu hệ thống

- **Node.js**: Version 12 hoặc cao hơn
- **PostgreSQL**: Database server
- **Redis**: Cache server (optional)
- **Chrome/Chromium**: Cho Puppeteer

## 📁 Cấu trúc thư mục

```
register-test/
├── src/
│   ├── config/           # Cấu hình database, Redis, Puppeteer
│   ├── utils/            # Utilities và helpers
│   ├── pages/            # Page Object Models
│   └── services/         # Database và Redis services
├── tests/
│   ├── setup/            # Cấu hình Jest
│   ├── fixtures/         # Test data fixtures
│   ├── integration/      # Integration tests
│   └── unit/             # Unit tests
├── scripts/              # Setup và utility scripts
├── logs/                 # Log files
├── screenshots/          # Test screenshots
└── README.md
```

## 🛠️ Cài đặt

### 1. Clone và cài đặt dependencies

```bash
cd register-test
npm install
```

### 2. Chạy setup script

```bash
npm run setup
```

Script này sẽ:
- Kiểm tra phiên bản Node.js
- Tạo các thư mục cần thiết
- Copy file cấu hình environment
- Test kết nối database và Redis
- Tạo database schema mẫu

### 3. Cấu hình environment

Sao chép và chỉnh sửa file `.env`:

```bash
cp env.example .env
```

Cập nhật các giá trị trong `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_test_db
DB_USER=your_username
DB_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Application Configuration
APP_URL=http://localhost:3000
TEST_TIMEOUT=30000
HEADLESS=true
SLOW_MO=0

# Test Configuration
SCREENSHOT_ON_FAILURE=true
BROWSER_WIDTH=1920
BROWSER_HEIGHT=1080
```

### 4. Thiết lập database

Chạy script SQL được tạo bởi setup:

```bash
psql -U your_username -d your_database -f database_schema.sql
```

## 🏃‍♂️ Chạy tests

### Chạy tất cả tests

```bash
npm test
```

### Chạy tests với watch mode

```bash
npm run test:dev
```

### Chạy test cụ thể

```bash
npm run test:single -- "User Registration"
```

### Chạy tests với coverage

```bash
npm run test:coverage
```

## 📖 Hướng dẫn sử dụng

### 1. Tạo Page Object mới

```javascript
const BasePage = require('./BasePage');

class NewPage extends BasePage {
  constructor(browserManager) {
    super(browserManager);
    this.pageTitle = 'Page Title';
    this.pageUrl = process.env.APP_URL + '/page-path';
    
    this.selectors = {
      inputField: '#input-id',
      submitButton: '#submit-btn'
    };
  }

  async fillInput(value) {
    await this.fillInput(this.selectors.inputField, value);
  }
}
```

### 2. Viết test case

```javascript
const BrowserManager = require('../../src/utils/browser');
const NewPage = require('../../src/pages/NewPage');

describe('New Page Tests', () => {
  let browserManager;
  let page;

  beforeAll(async () => {
    browserManager = new BrowserManager();
    await browserManager.launchBrowser();
  });

  afterAll(async () => {
    await browserManager.closeBrowser();
  });

  beforeEach(async () => {
    page = new NewPage(browserManager);
    await page.createPage();
  });

  test('should perform action successfully', async () => {
    await page.navigate();
    await page.fillInput('test value');
    // Add assertions
  });
});
```

### 3. Sử dụng Database Service

```javascript
const DatabaseService = require('../services/DatabaseService');

// Tạo user
const userData = {
  email: 'test@example.com',
  passwordHash: 'hashed_password',
  firstName: 'Test',
  lastName: 'User'
};

const user = await DatabaseService.createUser(userData);

// Lấy user theo email
const foundUser = await DatabaseService.getUserByEmail('test@example.com');

// Cleanup sau test
await DatabaseService.deleteTestUsers();
```

### 4. Sử dụng Redis Service

```javascript
const RedisService = require('../services/RedisService');

// Lưu session
await RedisService.setSession('sessionId', sessionData, 3600);

// Lấy session
const session = await RedisService.getSession('sessionId');

// Lưu OTP
await RedisService.setOTP('user@example.com', '123456', 300);
```

### 5. Sử dụng Test Helpers

```javascript
const TestHelpers = require('../utils/helpers');

// Tạo data ngẫu nhiên
const email = TestHelpers.generateRandomEmail();
const phone = TestHelpers.generateRandomPhone();
const password = TestHelpers.generateRandomPassword();

// Tạo complete registration data
const userData = TestHelpers.generateRegistrationData();

// Validate data
const isValidEmail = TestHelpers.isValidEmail(email);
const passwordStrength = TestHelpers.validatePasswordStrength(password);
```

## 🧪 Test Cases có sẵn

### Integration Tests
- **Successful Registration**: Test đăng ký thành công với data hợp lệ
- **Email Validation**: Test validation các format email không hợp lệ
- **Password Validation**: Test validation độ mạnh mật khẩu
- **Phone Validation**: Test validation số điện thoại Việt Nam
- **Required Fields**: Test các trường bắt buộc
- **Duplicate Registration**: Test ngăn chặn đăng ký email trùng
- **UI/UX Validation**: Test giao diện và trải nghiệm người dùng
- **Performance Tests**: Test thời gian tải và xử lý

### Unit Tests
- **Helper Functions**: Test các hàm utility
- **Data Generation**: Test tạo data ngẫu nhiên
- **Validation Functions**: Test các hàm validate
- **Retry Logic**: Test logic retry

## 🔧 Cấu hình nâng cao

### Puppeteer Configuration

Chỉnh sửa `src/config/puppeteer.js` để thay đổi cài đặt browser:

```javascript
// Thay đổi viewport
defaultViewport: {
  width: 1366,
  height: 768
}

// Thêm args cho Chrome
args: [
  '--disable-web-security',
  '--disable-features=VizDisplayCompositor'
]
```

### Jest Configuration

Chỉnh sửa `package.json` để thay đổi cài đặt Jest:

```json
{
  "jest": {
    "testTimeout": 60000,
    "maxWorkers": 2,
    "testPathIgnorePatterns": ["/node_modules/", "/build/"]
  }
}
```

### Logger Configuration

Chỉnh sửa `src/utils/logger.js` để thay đổi log level:

```javascript
const logLevel = process.env.LOG_LEVEL || 'debug';
```

## 📊 Reports và Screenshots

- **Test Reports**: Được tạo trong `tests/reports/`
- **Coverage Reports**: Được tạo trong `tests/coverage/`
- **Screenshots**: Được lưu trong `screenshots/` khi test fail
- **Logs**: Được lưu trong `logs/`

## 🐛 Troubleshooting

### Lỗi kết nối database
```bash
# Kiểm tra PostgreSQL service
sudo service postgresql status

# Kiểm tra cấu hình trong .env
DB_HOST=localhost
DB_PORT=5432
```

### Lỗi kết nối Redis
```bash
# Kiểm tra Redis service
redis-cli ping

# Hoặc start Redis
redis-server
```

### Lỗi Puppeteer
```bash
# Install Chrome dependencies trên Linux
sudo apt-get install -y libgconf-2-4 libxss1 libxtst6 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libcairo-gobject2 libgtk-3-0 libgdk-pixbuf2.0-0
```

### Lỗi timeout
- Tăng `TEST_TIMEOUT` trong `.env`
- Chỉnh sửa `testTimeout` trong Jest config
- Kiểm tra network và server response time

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.
