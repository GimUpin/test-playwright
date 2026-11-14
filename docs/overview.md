# Overview dự án

## 1. Project này là gì?

Đây là framework **Automation API Testing** dùng:

- **Playwright Test** (test runner + API request)
- **TypeScript**
- **Zod** (validate dữ liệu)
- **dotenv** (cấu hình môi trường)

Hiện tại project tập trung vào **BankGW Partner Fund-Transfer** qua PGW.

## 2. Phạm vi hiện tại

### API đang cover

```text
POST {CORE_PGW_URL}/bankgw-service/v1.0/partner/fund-transfer
```

Ví dụ môi trường DEV:

```text
https://core-aff.dev.accesstrade.me/pgw-api/bankgw-service/v1.0/partner/fund-transfer
```

### Việc framework đã làm sẵn

1. Đọc cấu hình từ `.env`
2. Tạo header ký HMAC mỗi request:
   - `client-id`
   - `client-trace-no` (UUID)
   - `client-request-time` (epoch ms)
   - `client-signature` (HMAC-SHA256)
3. Gửi request fund-transfer
4. Kiểm tra schema / header / status
5. Xuất HTML report + JUnit XML

## 3. Ai dùng project?

| Vai trò | Mục tiêu | Tài liệu nên đọc |
|---|---|---|
| Manual Tester | Chạy test, đọc report, log bug | Overview → Playwright là gì → Cài đặt → Hướng dẫn Tester |
| Automation Tester | Thêm API, viết test | Architecture → Mở rộng API → Writing tests |
| Dev/BA | Cấp credential, xác nhận contract | Overview + Troubleshooting |

## 4. Lợi ích so với chỉ dùng Postman

| Postman | Project này |
|---|---|
| Chạy tay từng request | Chạy hàng loạt bằng lệnh |
| Khó regression tự động | Regression lặp lại ổn định |
| Pre-request script rời | Signing tập trung trong code |
| Khó CI/CD | Đã có GitHub Actions skeleton |
| Kết quả khó chuẩn hóa | HTML report + JUnit |

## 5. Luồng tổng quan

```text
Tester chạy npm script
        |
        v
Playwright đọc .env (CLIENT_ID, CLIENT_SECRET, PGW URL)
        |
        v
buildSignedCoreHeaders() tạo chữ ký HMAC
        |
        v
BankGwClient.partnerFundTransfer() gọi API
        |
        v
Test assert kết quả
        |
        v
Xuất playwright-report/
```

## 6. Trạng thái phát triển

| Hạng mục | Trạng thái |
|---|---|
| Partner fund-transfer | Đã có |
| HMAC header signing | Đã có |
| Contract/smoke tests | Đã có |
| Live API flag | Đã có |
| Thêm API BankGW khác | Có thể mở rộng theo docs |
| UI testing | Chưa dùng trong scope hiện tại |

## 7. Bước tiếp theo nên đọc

- Mới bắt đầu: [Playwright là gì](./01-playwright-la-gi.md)
- Cài máy: [Cài đặt project](./02-cai-dat-project.md)
- Chạy hàng ngày: [Hướng dẫn Tester](./huong-dan-tester.md)
- Thêm API mới: [Mở rộng API](./03-mo-rong-api.md)
