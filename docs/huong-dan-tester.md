# Hướng dẫn sử dụng dành cho Tester (không cần biết code)

Tài liệu “cầm tay chỉ việc” để **cài – cấu hình – chạy – đọc report**.

Nếu muốn hiểu sâu hơn, xem thêm mục lục tại [docs/README.md](./README.md).

---

## 1. Project này làm gì?

Dùng Playwright để kiểm thử API:

```text
POST /pgw-api/bankgw-service/v1.0/partner/fund-transfer
```

Framework tự:

- Ký header HMAC
- Gửi request
- Báo Pass/Fail

Bạn không cần biết code để chạy hàng ngày.

---

## 2. Playwright là gì? (siêu ngắn)

Là tool automation. Trong project này đóng vai trò giống “Postman chạy tự động bằng lệnh”.

Chi tiết: [01-playwright-la-gi.md](./01-playwright-la-gi.md)

---

## 3. Cài đặt lần đầu

Chi tiết đầy đủ: [02-cai-dat-project.md](./02-cai-dat-project.md)

Tóm tắt:

```powershell
cd D:\Work\Mine\test-playwright
node -v
npm -v
npm install
npm run prepare:env
```

Điền trong `config/environments/.env`:

```env
CLIENT_ID=...
CLIENT_SECRET=...
CORE_PGW_URL=https://core-aff.dev.accesstrade.me/pgw-api
RUN_BANKGW_API_TESTS=false
```

---

## 4. Lệnh dùng hàng ngày

| Mục đích | Lệnh |
|---|---|
| Test an toàn | `npm run test:api:bankgw` |
| Test live API | `npm run test:api:bankgw:live` |
| Xem report | `npm run test:report` |
| Chạy DEV | `npm run test:api:dev` |
| Chạy UAT | `npm run test:api:uat` |
| Smoke only | `npm run test:smoke` |

---

## 5. Đọc kết quả

- `passed` = đạt
- `failed` = lỗi (xem report)
- `skipped` = bỏ qua (thường do chưa bật live)

Mở report:

```powershell
npm run test:report
```

### Xem status_code / request / response / cURL trên UI

Tab **Network** có thể trống (bình thường với API test).

Vào tab **Attachments**, ưu tiên mở:

- `*.full.txt` → có **status_code + request + response + curl**
- `*.masked.txt` → bản đã mask chữ ký
- `*-summary.json` → JSON đầy đủ

Muốn có response thật: chạy live `npm run test:api:bankgw:live`.

Chi tiết: [xem-api-log-va-curl.md](./xem-api-log-va-curl.md)

---

## 6. Checklist trước khi chạy live

- [ ] Đúng môi trường DEV/UAT
- [ ] Có quyền gọi API
- [ ] `CLIENT_ID`/`CLIENT_SECRET` đúng
- [ ] Hiểu payload có thể tạo giao dịch thật
- [ ] Đã thông báo team nếu cần

---

## 7. Khi fail phải gửi gì cho Dev?

1. Lệnh bạn đã chạy
2. Ảnh/HTML report
3. Thời gian chạy
4. `ENV` đang dùng (dev/uat)
5. `txn_id` (nếu có)

---

## 8. Muốn tự thêm API thì sao?

Làm theo:

[03-mo-rong-api.md](./03-mo-rong-api.md)

Không cần giỏi code ngay. Hãy copy pattern fund-transfer.

---

## 9. Lỗi hay gặp

Xem: [troubleshooting.md](./troubleshooting.md)

Các lỗi phổ biến:

- npm không nhận / bị chặn script PowerShell
- thiếu CLIENT_ID/SECRET
- live bị skip
- 401 do sai chữ ký

---

## 10. Tóm tắt 30 giây

```powershell
npm install
npm run prepare:env
# điền CLIENT_ID + CLIENT_SECRET
npm run test:api:bankgw
npm run test:report
```
