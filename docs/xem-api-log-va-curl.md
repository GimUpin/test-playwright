# Xem API log, status_code, request, response và cURL

Tab **Network** trong UI Mode không hiện APIRequestContext.  
Project gắn artifact đầy đủ vào **Attachments**.

---

## 1. File cần mở trên UI

Sau khi chạy test, vào tab **Attachments**:

| File | Nội dung |
|---|---|
| `*.full.txt` | **status_code + request + response + curl** (đầy đủ) |
| `*.masked.txt` | Bản đã mask chữ ký (an toàn share) |
| `*-summary.json` | JSON: status_code, request, response |
| `*.curl.txt` | Chỉ lệnh curl |
| `*.curl.masked.txt` | Curl đã mask |

> Nên mở `*.full.txt` trước — đủ thông tin nhất.

### Nội dung mẫu `*.full.txt`

```text
========== API DEBUG DUMP ==========
method: POST
url: https://.../partner/fund-transfer
status_code: 200
duration_ms: 123

---------- REQUEST ----------
[headers]
...
[body]
...

---------- RESPONSE ----------
[headers]
...
[body]
...

---------- CURL ----------
curl --location --request POST '...' \
  --header '...' \
  --data-raw '...'
========== END ==========
```

---

## 2. Khi nào có response / status_code?

| Test | Có request | Có status/response |
|---|---|---|
| Smoke `build curl + request dump...` | Có (preview) | Chưa (chưa gọi live) |
| Live `POST /v1.0/partner/fund-transfer` | Có | **Có đủ** |

Chạy live:

```powershell
npm run test:api:bankgw:live
```

Hoặc UI Mode + chọn live test.

---

## 3. Xem ở terminal

Log cũng in full dump (đã mask):

```text
API POST https://... -> status_code=200 (123ms)
========== API DEBUG DUMP ==========
...
```

Bật thêm:

```env
LOG_LEVEL=debug
```

---

## 4. HTML report

```powershell
npm run test:report
```

Vào test → Attachments → mở `*.full.txt`.
