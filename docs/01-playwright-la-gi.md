# Playwright là gì? (Tài liệu đầy đủ cho Tester)

## 1. Playwright theo cách hiểu của Tester

**Playwright** là bộ công cụ automation testing do Microsoft phát triển.

Playwright có thể dùng để test:

- Website (UI) — click, điền form, kiểm tra màn hình
- API (Backend) — gửi GET/POST/PUT/DELETE, kiểm tra response

> Trong project này, chúng ta dùng Playwright chủ yếu cho **API testing**.

## 2. Vì sao chọn Playwright cho API?

1. Có sẵn `APIRequestContext` (gửi HTTP request)
2. Có test runner mạnh (parallel, retry, report)
3. Dễ gắn vào CI/CD
4. Cùng một tool có thể mở rộng sang UI sau này nếu cần
5. TypeScript hỗ trợ bắt lỗi sớm khi viết test

## 3. So sánh với công cụ Tester hay dùng

### 3.1. Playwright vs Postman

| Tiêu chí | Postman | Playwright |
|---|---|---|
| Gửi API | Rất tốt, trực quan | Tốt, qua code/script |
| Tạo chữ ký tự động | Pre-request Script | Function trong project |
| Chạy nhiều case | Collection Runner | `npm run ...` |
| Regression tự động | Hạn chế hơn | Mạnh |
| Report chuẩn | Cơ bản | HTML/JUnit chuyên nghiệp |
| CI/CD | Có thể | Rất phù hợp |
| Học với người không code | Dễ hơn | Cần lệnh + cấu hình |

**Kết luận thực tế:**

- Dùng Postman để explore API / demo nhanh
- Dùng Playwright để regression ổn định, lặp lại mỗi ngày

### 3.2. Playwright vs Selenium / Cypress

| Tool | Thế mạnh |
|---|---|
| Selenium | UI web cổ điển, đa ngôn ngữ |
| Cypress | UI frontend hiện đại |
| Playwright | UI + API, nhanh, ổn định, report tốt |

Project này không dùng Selenium/Cypress vì scope hiện tại là API.

## 4. Các khái niệm quan trọng

### Test case

Một tình huống kiểm thử, ví dụ:

- Payload fund-transfer hợp lệ
- Header ký HMAC đủ field
- Gọi live API và không bị lỗi server 5xx

### Assertion

Điều kiện để kết luận Pass/Fail, ví dụ:

- Status code < 500
- `client-signature` đúng định dạng 64 ký tự hex

### Fixture

Cơ chế “chuẩn bị sẵn đồ dùng” cho test.  
Ví dụ fixture `bankGwClient` giúp test không phải tự khởi tạo client.

### Environment (`.env`)

Nơi chứa thông số môi trường:

- URL PGW
- CLIENT_ID / CLIENT_SECRET
- Bật/tắt live test

### Report

Báo cáo sau khi chạy test (Pass/Fail/Skip + chi tiết lỗi).

## 5. Playwright làm gì trong project này?

```text
1. Đọc cấu hình
2. Tạo header ký số
3. Gửi POST fund-transfer
4. Kiểm tra kết quả
5. Ghi report
```

Bạn không cần nhớ code HMAC. Chỉ cần biết:

- Điền secret đúng
- Chạy đúng lệnh
- Đọc report

## 6. Contract test và Live test

### Contract / Smoke test

- Không nhất thiết gọi hệ thống thật
- Kiểm tra payload, header, format
- An toàn để chạy thường xuyên

### Live test

- Gọi API thật trên DEV/UAT
- Cần quyền + credential đúng
- Có thể tạo giao dịch thật (cẩn thận)

Trong project:

- `npm run test:api:bankgw` → có smoke, live có thể bị skip
- `npm run test:api:bankgw:live` → bật live

## 7. Thuật ngữ hay gặp trên terminal

| Từ | Nghĩa |
|---|---|
| `passed` | Test đạt |
| `failed` | Test thất bại |
| `skipped` | Test bị bỏ qua (thường do chưa bật live) |
| `flaky` | Test lúc pass lúc fail (cần điều tra) |
| `timeout` | Chờ quá lâu |
| `worker` | Tiến trình chạy song song |

## 8. Tester nên học thêm gì nếu muốn phát triển?

Không cần thành dev, nhưng nên biết dần:

1. JSON là gì (request/response body)
2. HTTP status code (200, 400, 401, 500...)
3. Header / Body khác nhau thế nào
4. Đọc được file test `.spec.ts` ở mức cơ bản
5. Copy pattern có sẵn để thêm API mới (xem [03-mo-rong-api.md](./03-mo-rong-api.md))

## 9. Tài liệu chính thức (tham khảo thêm)

- Playwright docs: https://playwright.dev/
- API testing với Playwright: https://playwright.dev/docs/api-testing

Tiếp theo: [Cài đặt project](./02-cai-dat-project.md)
