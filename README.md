# Chrome Extension - Thống Kê Lượt Truy Cập Web

Extension Chrome để thống kê số lượt truy cập và lịch sử các lần truy cập trang web.

## Tính năng

- ✅ Tự động theo dõi số lượt truy cập các trang web
- ✅ Hiển thị số lượt truy cập của trang hiện tại
- ✅ Xem lịch sử chi tiết các lần truy cập
- ✅ Lọc theo trang hiện tại hoặc tất cả trang
- ✅ Xóa lịch sử truy cập
- ✅ Giao diện đẹp, dễ sử dụng

## Cài đặt

### Bước 1: Tạo Icons (Tùy chọn)

Extension cần các icon để hiển thị. Bạn có thể:

**Cách 1: Sử dụng file create-icons.html**
1. Mở file `create-icons.html` trong trình duyệt
2. Click "Tạo Icons" để xem preview
3. Click các nút "Tải Icon" để tải về
4. Lưu các file icon vào thư mục `icons/` với tên:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

**Cách 2: Tạo icon thủ công**
- Tạo 3 file PNG với kích thước 16x16, 48x48, 128x128
- Đặt tên: `icon16.png`, `icon48.png`, `icon128.png`
- Lưu vào thư mục `icons/`

**Lưu ý:** Extension vẫn hoạt động nếu không có icon (sẽ dùng icon mặc định của Chrome)

### Bước 2: Tải extension

1. Mở Chrome và truy cập `chrome://extensions/`
2. Bật "Chế độ dành cho nhà phát triển" (Developer mode) ở góc trên bên phải
3. Click "Tải tiện ích đã giải nén" (Load unpacked)
4. Chọn thư mục `thongkeluotwweb`

### Bước 2: Sử dụng

1. Sau khi cài đặt, icon extension sẽ xuất hiện trên thanh công cụ
2. Click vào icon để mở popup và xem thống kê
3. Extension sẽ tự động theo dõi các lượt truy cập khi bạn duyệt web

## Cấu trúc file

```
thongkeluotwweb/
├── manifest.json       # Cấu hình extension
├── popup.html          # Giao diện popup
├── popup.css           # Styling cho popup
├── popup.js            # Logic hiển thị dữ liệu
├── background.js       # Service worker theo dõi lịch sử
├── icons/              # Icons cho extension
└── README.md           # File hướng dẫn
```

## Quyền sử dụng

Extension yêu cầu các quyền sau:
- `tabs`: Để lấy thông tin tab hiện tại
- `history`: Để truy cập lịch sử trình duyệt (tùy chọn)
- `storage`: Để lưu trữ dữ liệu thống kê

## Lưu ý

- Dữ liệu được lưu trữ cục bộ trong Chrome storage
- Mỗi domain chỉ lưu tối đa 100 lượt truy cập gần nhất để tiết kiệm dung lượng
- Extension không theo dõi các trang nội bộ của Chrome (chrome://, about:, etc.)

## Phát triển

Để chỉnh sửa extension:
1. Sửa các file trong thư mục `thongkeluotwweb`
2. Vào `chrome://extensions/`
3. Click nút "Tải lại" (Reload) trên extension để áp dụng thay đổi

## Tác giả

Extension được tạo để thống kê và theo dõi lượt truy cập trang web.

