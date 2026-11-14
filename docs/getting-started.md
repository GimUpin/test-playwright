# Getting Started (Technical)

> Tester mới: ưu tiên đọc [Hướng dẫn Tester](./huong-dan-tester.md) và [Cài đặt project](./02-cai-dat-project.md).

## Setup nhanh

```powershell
npm install
npm run prepare:env
```

Cấu hình `.env`:

```env
CORE_PGW_URL=https://core-aff.dev.accesstrade.me/pgw-api
CLIENT_ID=...
CLIENT_SECRET=...
RUN_BANKGW_API_TESTS=false
```

## Run

```powershell
npm run typecheck
npm run lint
npm run test:api:bankgw
npm run test:api:bankgw:live
npm run test:report
```

## Next

- Architecture: [architecture.md](./architecture.md)
- Add new API: [03-mo-rong-api.md](./03-mo-rong-api.md)
