# Fixtures

## 1. Fixture là gì?

Fixture giúp “bơm” sẵn object vào test, tester/automation không phải khởi tạo thủ công.

## 2. Fixture hiện có

Trong `src/core/fixtures/api.fixture.ts`:

| Fixture | Kiểu | Dùng để |
|---|---|---|
| `bankGwClient` | `BankGwClient` | Gọi API BankGW |

Ví dụ:

```typescript
test('demo', async ({ bankGwClient }) => {
  const response = await bankGwClient.partnerFundTransfer(payload);
});
```

## 3. Cách thêm fixture mới

1. Import client mới
2. Thêm vào type `ApiFixtures`
3. `extend` provider

```typescript
otpClient: async ({ request }, use) => {
  await use(new OtpClient(request));
},
```

## 4. Data fixtures / builders

| Builder | Mục đích |
|---|---|
| `FundTransferDataBuilder` | Tạo payload fund-transfer |

Ví dụ:

```typescript
FundTransferDataBuilder.create()
  .withAmount(1000)
  .withBankCode('TPBVVNVX')
  .build();
```
