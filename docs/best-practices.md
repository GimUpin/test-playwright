# Best Practices

## 1. Cho Tester vận hành hàng ngày

1. Luôn kiểm tra đúng file `.env` trước khi chạy live
2. Ưu tiên chạy smoke trước, live sau
3. Đọc HTML report trước khi kết luận bug
4. Khi fail: lưu timestamp + request log + ảnh report
5. Không chia sẻ `CLIENT_SECRET`

## 2. Cho người viết/mở rộng test

1. Client chỉ gọi API, không assert nghiệp vụ
2. Test độc lập, chạy song song được
3. Không dùng fixed sleep
4. Không retry mù quáng request có side effect (fund-transfer)
5. Một test chỉ verify 1 ý chính
6. Đặt tên test theo hành vi: `should ...` / `POST ...`

## 3. Cho quản lý dữ liệu test

1. Dùng builder tạo dữ liệu động (`txn_id` random)
2. Không phụ thuộc dữ liệu cố định dễ bị thay trên server
3. Ghi rõ account ngân hàng test được phép dùng

## 4. Cho bảo mật & môi trường

1. Secret chỉ nằm local/CI secrets
2. Logger phải mask signature/secret
3. Phân tách DEV/UAT rõ ràng

## 5. Review PR nên hỏi gì?

- API mới có model/schema/client/test đủ chưa?
- Có live skip flag chưa?
- Có hardcode secret không?
- Docs đã cập nhật chưa?
