# Playwright BankGW Partner Fund-Transfer

Framework automation API bằng **Playwright + TypeScript**.

## API hiện tại

```text
POST https://core-aff.dev.accesstrade.me/pgw-api/bankgw-service/v1.0/partner/fund-transfer
```

Tự động ký header HMAC:

- `client-id`
- `client-trace-no` (UUID)
- `client-request-time`
- `client-signature`

---

## Tài liệu đầy đủ (bắt đầu từ đây)

Mục lục chính: **[docs/README.md](docs/README.md)**

### Lộ trình đề xuất

#### Tester mới (không biết code)

1. [Overview](docs/overview.md)
2. [Playwright là gì](docs/01-playwright-la-gi.md)
3. [Cài đặt project](docs/02-cai-dat-project.md)
4. [Hướng dẫn Tester](docs/huong-dan-tester.md)
5. [Xem API log & cURL trên UI](docs/xem-api-log-va-curl.md)
6. [Troubleshooting](docs/troubleshooting.md)

#### Tester muốn phát triển thêm API

1. [Architecture](docs/architecture.md)
2. [Mở rộng API mới](docs/03-mo-rong-api.md)
3. [Writing API tests](docs/writing-api-tests.md)
4. [Fixtures](docs/fixtures.md)
5. [Best practices](docs/best-practices.md)

---

## Quick start

```powershell
cd D:\Work\Mine\test-playwright
npm install
npm run prepare:env
```

Điền `CLIENT_ID` / `CLIENT_SECRET` trong `config/environments/.env`:

```powershell
npm run test:api:bankgw
npm run test:report
```

Live API:

```powershell
npm run test:api:bankgw:live
```

## Bảng lệnh chính

| Lệnh | Mục đích |
|---|---|
| `npm run prepare:env` | Tạo file `.env` |
| `npm run test:api:bankgw` | Chạy test BankGW |
| `npm run test:api:bankgw:live` | Gọi API thật |
| `npm run test:report` | Mở HTML report |
| `npm run test:api:dev` | Theo ENV=dev |
| `npm run test:api:uat` | Theo ENV=uat |
| `npm run typecheck` | Kiểm tra TypeScript |
| `npm run lint` | Kiểm tra ESLint |

## Cấu trúc project

```text
tests/api/bankgw/      Test cases
config/environments/   .env
src/clients/bankgw/    API client
src/core/auth/         HMAC signing
src/core/api/          BaseClient
docs/                  Tài liệu đầy đủ
playwright-report/     Report sau khi chạy
```
