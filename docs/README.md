# Tài liệu Playwright BankGW

Bộ tài liệu đầy đủ cho Tester và Automation khi làm việc với project này.

## Đọc theo lộ trình

### Dành cho Tester mới (chưa biết code)

| # | Tài liệu | Nội dung |
|---|---|---|
| 1 | [Overview](./overview.md) | Project làm gì, phạm vi, vai trò |
| 2 | [Playwright là gì](./01-playwright-la-gi.md) | Khái niệm Playwright, API testing, so với Postman |
| 3 | [Cài đặt project](./02-cai-dat-project.md) | Node, npm, env, cài dependency |
| 4 | [Hướng dẫn Tester](./huong-dan-tester.md) | Chạy test, xem report, checklist hàng ngày |
| 4b | [Xem API log & cURL](./xem-api-log-va-curl.md) | Attachments, curl, vì sao Network trống |

### Dành cho Tester muốn phát triển thêm API

| # | Tài liệu | Nội dung |
|---|---|---|
| 5 | [Architecture](./architecture.md) | Cấu trúc thư mục, luồng request |
| 6 | [Mở rộng API mới](./03-mo-rong-api.md) | Quy trình thêm endpoint từng bước |
| 7 | [Writing API tests](./writing-api-tests.md) | Viết test, assertion, tag |
| 8 | [Fixtures](./fixtures.md) | Inject client vào test |
| 9 | [Best practices](./best-practices.md) | Quy ước bảo trì |
| 10 | [Troubleshooting](./troubleshooting.md) | Lỗi thường gặp |

## Mục tiêu tài liệu

- Giúp tester **chạy được test** mà không cần code
- Giúp tester/automation **mở rộng thêm API** theo pattern có sẵn
- Giảm phụ thuộc hỏi đi hỏi lại về cài đặt / lệnh chạy
