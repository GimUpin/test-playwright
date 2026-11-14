# Troubleshooting (Đầy đủ)

## A. Lỗi cài đặt / máy local

### A1. `npm` không được nhận

**Triệu chứng:** `npm : The term 'npm' is not recognized`

**Cách xử lý:**

1. Cài Node 22
2. Mở terminal mới
3. Refresh PATH:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

### A2. `npm.ps1 cannot be loaded`

**Nguyên nhân:** PowerShell Execution Policy

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

Hoặc:

```powershell
npm.cmd install
```

### A3. `npm install` chậm / fail mạng

- Thử lại mạng công ty/VPN
- Xóa `node_modules` + `package-lock.json` rồi `npm install` lại (cẩn thận khi làm)

## B. Lỗi cấu hình

### B1. Invalid environment configuration

Thiếu biến bắt buộc trong `.env`:

- `CORE_PGW_URL`
- `CLIENT_ID`
- `CLIENT_SECRET`

Chạy:

```powershell
npm run prepare:env
```

rồi điền lại.

### B2. `CLIENT_ID and CLIENT_SECRET are required to sign...`

Signing function không nhận được secret. Kiểm tra:

- Đúng file env theo `ENV=dev/uat`
- Không để trống giá trị
- Không có dấu nháy/khoảng trắng lạ

## C. Lỗi khi chạy test

### C1. Live test luôn skipped

Bình thường nếu chưa bật live.

Chạy:

```powershell
npm run test:api:bankgw:live
```

### C2. Fail do status 401/403

- Sai `CLIENT_ID`/`CLIENT_SECRET`
- Sai môi trường URL
- Account chưa được grant quyền partner

### C3. Fail do status 400

- Payload thiếu field
- Sai kiểu dữ liệu (`transfer_amount` phải là number)
- Account/bank code không hợp lệ

### C4. Fail do timeout

- API chậm hoặc mạng kém
- Tăng `API_TIMEOUT` trong `.env` (ví dụ `60000`)

### C5. Typecheck/lint fail sau khi sửa code

```powershell
npm run typecheck
npm run lint
```

Đọc lỗi dòng số và sửa theo gợi ý TypeScript/ESLint.

## D. Report / UI Mode / cURL

### D1. `npm run test:report` không có data

Phải chạy test trước để sinh `playwright-report/`.

### D2. Muốn xem log chi tiết

Đặt:

```env
LOG_LEVEL=debug
```

### D3. UI Mode tab Network trống

Bình thường với API test. Xem tab **Attachments** để lấy:

- `*.curl.txt`
- `*-summary.json`

Chi tiết: [xem-api-log-va-curl.md](./xem-api-log-va-curl.md)

### D4. Không thấy file curl

Chạy lại test có gọi API hoặc test smoke `build curl for partner fund-transfer`, rồi mở **Attachments**.

## E. Khi nào escalate cho Dev/Automation?

- Contract API đổi nhưng docs chưa rõ
- Signature algorithm phía server đổi
- Cần thêm service mới ngoài BankGW
- CI fail không tái hiện được local
