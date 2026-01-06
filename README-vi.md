# Nền tảng Đấu giá Trực tuyến

## Yêu cầu thiết lập
- Node.js (phiên bản 16 trở lên)
- Tài khoản MongoDB Atlas (hoặc MongoDB local)
- Tài khoản Cloudinary (để tải lên hình ảnh)
- Tài khoản Gmail (để gửi thông báo email)
- Google reCAPTCHA key
- Git (để clone project)

## Cài đặt và Thiết lập

### 1. Tải code về máy
```bash
git clone <repository-url>
cd OnlineAuction
```

### 2. Thiết lập Cơ sở dữ liệu
1. **Tạo tài khoản MongoDB Atlas**: Đăng ký tại [MongoDB Atlas](https://www.mongodb.com/atlas).
2. **Tạo Cluster**: Chọn cluster miễn phí (M0 Sandbox).
3. **Cho phép IP**: Thêm `0.0.0.0/0` để cho phép tất cả IP truy cập.
4. **Tạo Database User**: Truy cập Database Access > Add New Database User.
5. **Lấy Connection string**: Truy cập Clusters > Connect > Connect your application. Sao chép connection string.

### 3. Thiết lập Backend
```bash
cd api
npm install
cp .env.example .env
```

Chỉnh sửa `api/.env` và cấu hình đầy đủ các nội dung:

**Kiểm tra kết nối cơ sở dữ liệu:**
```bash
npm run test:db
```
Nếu cấu hình đúng, kết quả sẽ trả về `✓ Connected to MongoDB`.

### 4. Thiết lập Frontend
```bash
cd ../web
npm install
cp .env.example .env
```

Chỉnh sửa `web/.env` và cấu hình đầy đủ các nội dung.

## Chạy Ứng dụng

**Terminal 1 - Khởi động Backend:**
```bash
cd api
npm run dev
```
Backend sẽ mặc định chạy trên `http://localhost:3000`

**Terminal 2 - Khởi động Frontend:**
```bash
cd web
npm run dev
```
Frontend sẽ mặc định chạy trên `http://localhost:5173`