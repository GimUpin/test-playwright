# Writing API Tests

## 1. File test nằm ở đâu?

```text
tests/api/bankgw/*.spec.ts
```

## 2. Cấu trúc 1 test file chuẩn

```typescript
import { apiTest as test, expect } from '../../../src/core/fixtures';
import { FundTransferDataBuilder } from '../../../src/fixtures/data/fund-transfer.builder';
import {
  BANKGW_API_SKIP_REASON,
  shouldRunBankGwApiTests,
} from '../../../src/utils/bankgw-test-guard';

test.describe('BankGW partner fund-transfer @api @bankgw', () => {
  test('schema valid @smoke', () => {
    // contract
  });

  test.describe('live PGW', () => {
    test.skip(!shouldRunBankGwApiTests(), BANKGW_API_SKIP_REASON);

    test('POST fund-transfer', async ({ bankGwClient }) => {
      const payload = FundTransferDataBuilder.create().withAmount(1000).build();
      const response = await bankGwClient.partnerFundTransfer(payload);
      expect(response.status).toBeLessThan(500);
    });
  });
});
```

## 3. Nên assert những gì?

### Positive

- Status đúng (200/201 tùy API)
- Field bắt buộc có trong response
- Schema response (nếu đã có contract)

### Negative

- Thiếu field bắt buộc → 400
- Sai chữ ký → 401/403
- Sai định dạng số tiền → 400

### Boundary

- amount = 1
- amount rất lớn
- txn_id dài/ngắn

## 4. Tags

Dùng tag trong tên test/describe:

- `@api`
- `@bankgw`
- `@smoke`
- `@regression`

Chạy theo tag:

```powershell
npm run test:smoke
npm run test:regression
```

## 5. Data trong test

Ưu tiên builder:

```typescript
FundTransferDataBuilder.create().withAmount(50000).build();
```

Tránh hardcode nhiều chỗ cùng một payload.

## 6. Lỗi thường gặp khi viết test

1. Quên import fixture `apiTest`
2. Gọi live nhưng chưa bật flag → bị skip
3. Assert quá chặt vào data môi trường (dễ flaky)
4. Hardcode secret

## 7. Definition of Done cho 1 test case

- Tên test rõ nghĩa nghiệp vụ
- Có tag phù hợp
- Có assert rõ Pass/Fail
- Chạy local ổn định
- Không phụ thuộc thứ tự test khác
