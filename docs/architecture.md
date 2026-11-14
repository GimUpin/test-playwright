# Architecture

## 1. Mục tiêu kiến trúc

- Tách rõ: **config / auth / client / test**
- Dễ thêm API mới mà không phá code cũ
- Tester chạy được bằng lệnh, automation mở rộng được bằng pattern

## 2. Sơ đồ thành phần

```text
tests/api/bankgw/*.spec.ts
        |
        | dùng fixture bankGwClient
        v
src/core/fixtures/api.fixture.ts
        |
        v
src/clients/bankgw/bankgw.client.ts
        |
        +--> buildSignedCoreHeaders()   (HMAC)
        |
        v
src/core/api/base.client.ts
        |
        v
HTTP POST tới {CORE_PGW_URL}/bankgw-service/...
```

## 3. Trách nhiệm từng lớp

| Lớp | File chính | Chịu trách nhiệm | Không làm |
|---|---|---|---|
| Config | `src/core/config/environment.ts` | Load/validate `.env` | Business assert |
| Auth | `src/core/auth/core-headers.ts` | Sinh header HMAC | Gọi API |
| BaseClient | `src/core/api/base.client.ts` | GET/POST/PUT/PATCH/DELETE + log | Domain logic |
| Domain Client | `src/clients/bankgw/*` | Path + payload theo nghiệp vụ | Assert test-case |
| Models | `src/models/api/**` | TypeScript DTO | Runtime validate |
| Schemas | `src/schemas/**` | Zod runtime validate | Gọi HTTP |
| Fixtures | `src/core/fixtures/*` | Inject dependency vào test | Nghiệp vụ |
| Tests | `tests/api/**` | Arrange/Act/Assert | Tự new client lung tung |

## 4. Base URL strategy

Hiện tại mọi BankGW request đi qua PGW:

```text
BANKGW_BASE = {CORE_PGW_URL}/bankgw-service
ENDPOINT    = /v1.0/partner/fund-transfer
FULL URL    = BANKGW_BASE + ENDPOINT
```

## 5. Signing strategy

Tương đương Postman pre-request:

```text
stringToSign = CLIENT_ID + "|" + UUID + "|" + timestamp
signature    = HMAC_SHA256(stringToSign, CLIENT_SECRET).hex
```

Headers:

- `client-id`
- `client-trace-no`
- `client-request-time`
- `client-signature`

**Lưu ý:** phải tạo mới mỗi request (timestamp/UUID thay đổi).

## 6. Test strategy

| Loại | Mục đích | Flag |
|---|---|---|
| Smoke/Contract | Validate payload/header format | luôn chạy |
| Live | Gọi API thật | `RUN_BANKGW_API_TESTS=true` |

## 7. Mở rộng kiến trúc về sau

Khi thêm nhiều service:

```text
src/clients/
  bankgw/
  otp/
  conversion/
tests/api/
  bankgw/
  otp/
  conversion/
```

Giữ nguyên `BaseClient` + fixtures pattern.
