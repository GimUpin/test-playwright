# Hướng dẫn mở rộng thêm API (cho Tester/Automation)

Tài liệu này giúp bạn **thêm API mới** vào project theo đúng kiến trúc hiện tại, dù bạn mới bắt đầu với code.

> Mục tiêu: copy pattern có sẵn của `partner/fund-transfer`, không invent architecture mới.

---

## 1. Nguyên tắc vàng trước khi thêm API

1. **1 domain = 1 client** (ví dụ BankGW → `BankGwClient`)
2. **Test không gọi `request.post` trực tiếp**
3. **Assertion nằm ở test**, không nằm trong client
4. **Secret nằm ở `.env`**, không hardcode trong test
5. **Header ký HMAC tạo mới mỗi request**
6. Tách **contract test** và **live test**

---

## 2. Checklist thêm 1 API mới

Giả sử cần thêm:

```text
POST /v1.0/partner/txn-inquiry
```

Làm lần lượt:

1. [ ] Thêm model (DTO request)
2. [ ] Thêm Zod schema (validate)
3. [ ] Thêm method trong client
4. [ ] (Optional) Thêm data builder
5. [ ] Viết test smoke/contract
6. [ ] Viết live test (có skip flag)
7. [ ] Chạy `typecheck`, `lint`, test
8. [ ] Cập nhật tài liệu ngắn

---

## 3. Bước chi tiết (kèm ví dụ)

### Bước 1 — Model

File: `src/models/api/bankgw/bankgw.models.ts`

Thêm interface:

```typescript
export interface PartnerTxnInquiryRequest {
  txn_id: string;
}
```

### Bước 2 — Schema

File: `src/schemas/bankgw/bankgw.schema.ts`

```typescript
export const PartnerTxnInquiryRequestSchema = z.object({
  txn_id: z.string().min(1),
});
```

### Bước 3 — Client method

File: `src/clients/bankgw/bankgw.client.ts`

```typescript
async partnerTxnInquiry(payload: PartnerTxnInquiryRequest) {
  return this.post('/v1.0/partner/txn-inquiry', payload, {
    headers: buildSignedCoreHeaders(),
  });
}
```

> Nhớ import type mới ở đầu file.

### Bước 4 — Data builder (nếu payload nhiều field)

Có thể tạo `TxnInquiryDataBuilder` tương tự `FundTransferDataBuilder`.

Nếu payload chỉ 1-2 field, có thể tạo object thẳng trong test.

### Bước 5 — Viết test

File: `tests/api/bankgw/bankgw.spec.ts` (hoặc file mới `txn-inquiry.spec.ts`)

```typescript
test('txn-inquiry schema is valid @smoke', () => {
  validateSchema(PartnerTxnInquiryRequestSchema, { txn_id: 'txn-123' });
});

test.describe('live PGW', () => {
  test.skip(!shouldRunBankGwApiTests(), BANKGW_API_SKIP_REASON);

  test('POST /v1.0/partner/txn-inquiry', async ({ bankGwClient }) => {
    const response = await bankGwClient.partnerTxnInquiry({ txn_id: 'txn-123' });
    expect(response.status).toBeLessThan(500);
  });
});
```

### Bước 6 — Chạy kiểm tra

```powershell
npm run typecheck
npm run lint
npm run test:api:bankgw
```

---

## 4. Nếu API thuộc service mới (không phải BankGW)

Ví dụ sau này có `otp-service`:

### Tạo cấu trúc

```text
src/clients/otp/otp.client.ts
src/models/api/otp/...
src/schemas/otp/...
tests/api/otp/...
```

### Thêm base URL vào env

Trong `environment.ts` và `.env.example`:

```env
OTP_SERVICE_URL=https://...
```

### Đăng ký fixture

Trong `src/core/fixtures/api.fixture.ts`:

```typescript
otpClient: async ({ request }, use) => {
  await use(new OtpClient(request));
},
```

Sau đó test dùng:

```typescript
test('send otp', async ({ otpClient }) => {
  // ...
});
```

---

## 5. Map từ Postman sang Playwright (cách làm thực tế)

Khi BA/Dev đưa Postman request:

1. Copy **Method + Path**
2. Copy **Body JSON** → thành TypeScript interface
3. Copy **Headers đặc biệt**
   - Nếu giống HMAC hiện tại: tái sử dụng `buildSignedCoreHeaders()`
   - Nếu khác: tạo function sign mới (không sửa ẩu function cũ)
4. Xác định positive / negative case
5. Viết smoke trước, live sau

### Bảng chuyển đổi nhanh

| Postman | Playwright project |
|---|---|
| Request URL | `BaseClient` + path trong client |
| Body | `models` + builder |
| Pre-request Script | `src/core/auth/...` |
| Tests tab | `tests/api/...spec.ts` |
| Environment variable | `.env` |

---

## 6. Mẫu assertion thường dùng

```typescript
expect(response.status).toBe(200);
expect(response.status).toBeLessThan(500);
expect(response.body).toBeTruthy();
expect(response.body.code).toBe('SUCCESS'); // tùy contract thật
```

Validate schema:

```typescript
validateSchema(SomeSchema, payloadOrBody);
```

---

## 7. Quy ước đặt tên

| Thành phần | Quy ước | Ví dụ |
|---|---|---|
| Client class | `XxxClient` | `BankGwClient` |
| Method | động từ + nghiệp vụ | `partnerFundTransfer` |
| Model | `...Request` / `...Response` | `PartnerFundTransferRequest` |
| Schema | `...Schema` | `PartnerFundTransferRequestSchema` |
| Test file | `*.spec.ts` | `bankgw.spec.ts` |
| Tag | `@api`, `@smoke`, `@bankgw` | |

---

## 8. Những việc không nên làm

1. Không hardcode `CLIENT_SECRET` trong test
2. Không copy chữ ký cũ dùng lại nhiều request
3. Không bỏ `test.skip` cho live nếu môi trường chưa sẵn sàng
4. Không nhét nhiều service vào một client
5. Không assert nghiệp vụ bên trong client

---

## 9. Definition of Done khi thêm API

- [ ] Có model + schema
- [ ] Có method client
- [ ] Có ít nhất 1 smoke/contract test
- [ ] Có live test (có thể skip bằng flag)
- [ ] `typecheck` + `lint` pass
- [ ] Chạy local pass
- [ ] Cập nhật docs (ít nhất dòng trong overview/README nếu API quan trọng)

---

## 10. Lộ trình học để tự mở rộng

### Tuần 1

- Chạy thành thạo lệnh test/report
- Đọc hiểu `bankgw.spec.ts`

### Tuần 2

- Thêm 1 field vào payload builder
- Thêm 1 assertion mới

### Tuần 3

- Thêm 1 endpoint gần giống fund-transfer
- Tự làm PR nhỏ

### Tuần 4+

- Thêm service mới
- Chuẩn hóa negative tests / boundary tests

Tiếp theo: [Writing API tests](./writing-api-tests.md)
