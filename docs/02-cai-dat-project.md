# Cài đặt project (đầy đủ)

Tài liệu này hướng dẫn setup từ máy trống đến chạy được test đầu tiên.

---

## 1. Yêu cầu hệ thống

| Thành phần | Mức tối thiểu |
|---|---|
| OS | Windows 10/11 (cũng chạy được macOS/Linux) |
| Node.js | **22+** |
| npm | **10+** |
| Editor khuyến nghị | Cursor / VS Code |
| Mạng | Có thể gọi URL PGW khi chạy live |

---

## 2. Cài Node.js trên Windows

### Cách khuyến nghị: winget

Mở PowerShell và chạy:

```powershell
winget install OpenJS.NodeJS.22 --accept-package-agreements --accept-source-agreements
```

### Sau khi cài

1. **Đóng hết terminal cũ**
2. Mở terminal mới
3. Kiểm tra:

```powershell
node -v
npm -v
```

Ví dụ kết quả đúng:

```text
v22.23.5
10.9.9
```

### Nếu terminal cũ không nhận `node`/`npm`

Refresh PATH:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
node -v
npm -v
```

### Nếu lỗi Execution Policy với `npm.ps1`

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

Hoặc dùng:

```powershell
npm.cmd -v
npm.cmd install
```

---

## 3. Lấy source project

Nếu đã có sẵn thư mục:

```powershell
cd D:\Work\Mine\test-playwright
```

Nếu clone từ Git (khi team có remote):

```powershell
git clone <URL_REPO>
cd test-playwright
```

---

## 4. Cài dependency

```powershell
npm install
```

Lệnh này đọc `package.json` và tải thư viện vào `node_modules/`.

### Kiểm tra cài thành công

```powershell
npx playwright --version
```

> Project API hiện tại không bắt buộc cài browser Chromium để chạy API tests.  
> Nếu sau này có UI test mới cần `npx playwright install`.

---

## 5. Chuẩn bị file môi trường

```powershell
npm run prepare:env
```

Sẽ tạo (nếu chưa có):

```text
config/environments/.env
config/environments/.env.dev
config/environments/.env.uat
```

### Điền cấu hình tối thiểu

Mở `config/environments/.env`:

```env
ENV=dev
API_TIMEOUT=30000
LOG_LEVEL=info

CORE_PGW_URL=https://core-aff.dev.accesstrade.me/pgw-api
CLIENT_ID=YOUR_CLIENT_ID
CLIENT_SECRET=YOUR_CLIENT_SECRET

RUN_BANKGW_API_TESTS=false
```

### Ý nghĩa biến

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `CORE_PGW_URL` | Có | Base PGW |
| `CLIENT_ID` | Có | Dùng ký HMAC |
| `CLIENT_SECRET` | Có | Secret key HMAC |
| `RUN_BANKGW_API_TESTS` | Không | `true` để gọi API thật |
| `API_TIMEOUT` | Không | Timeout request (ms) |
| `LOG_LEVEL` | Không | `debug/info/warn/error` |

### Bảo mật

- Không commit file `.env`, `.env.dev`, `.env.uat`
- Chỉ commit file `*.example`
- Không gửi secret qua chat nhóm công khai

---

## 6. Kiểm tra chất lượng code (khuyến nghị)

```powershell
npm run typecheck
npm run lint
```

Nếu cả 2 pass là môi trường ổn.

---

## 7. Chạy test đầu tiên

### An toàn (không live)

```powershell
npm run test:api:bankgw
```

Kỳ vọng:

- Smoke tests **passed**
- Live test có thể **skipped**

### Live (gọi API thật)

```powershell
npm run test:api:bankgw:live
```

### Xem report

```powershell
npm run test:report
```

---

## 8. Cấu trúc thư mục sau khi setup

```text
test-playwright/
├── config/environments/     # .env cấu hình
├── docs/                    # Tài liệu
├── src/
│   ├── clients/bankgw/      # Client gọi API
│   ├── core/                # BaseClient, auth, fixtures, config
│   ├── fixtures/data/       # Data builder
│   ├── models/              # Kiểu dữ liệu request
│   ├── schemas/             # Zod schema
│   └── utils/               # Logger, helpers
├── tests/api/bankgw/        # Test cases
├── playwright.config.ts
├── package.json
└── README.md
```

---

## 9. Scripts quan trọng trong `package.json`

| Script | Công dụng |
|---|---|
| `prepare:env` | Copy env mẫu |
| `test:api:bankgw` | Chạy test BankGW |
| `test:api:bankgw:live` | Chạy có live API |
| `test:api:dev` / `test:api:uat` | Chọn ENV |
| `test:smoke` | Chỉ test tag `@smoke` |
| `test:report` | Mở HTML report |
| `typecheck` | Kiểm tra TypeScript |
| `lint` | Kiểm tra ESLint |

---

## 10. Checklist nghiệm thu máy mới

- [ ] `node -v` ra v22+
- [ ] `npm -v` chạy được
- [ ] `npm install` thành công
- [ ] Đã có `config/environments/.env`
- [ ] Đã điền `CLIENT_ID`, `CLIENT_SECRET`
- [ ] `npm run test:api:bankgw` không lỗi môi trường
- [ ] `npm run test:report` mở được report

---

## 11. Setup CI (tham khảo)

Workflow nằm ở:

```text
.github/workflows/playwright.yml
```

CI hiện chạy:

1. `npm ci`
2. `prepare:env`
3. `lint`
4. `typecheck`
5. `test:api:bankgw`

Live secret trên CI cần cấu hình riêng trong GitHub Secrets (không hardcode).

Tiếp theo: [Hướng dẫn Tester](./huong-dan-tester.md) hoặc [Mở rộng API](./03-mo-rong-api.md)
