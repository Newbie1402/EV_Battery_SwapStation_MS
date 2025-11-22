# EV Battery Swap Station Management System - Frontend

Hệ thống quản lý trạm đổi pin xe điện - Giao diện người dùng

## 🚀 Công nghệ sử dụng

- **React 19** - UI Library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Shadcn UI** - Component library
- **React Query** - Data fetching & caching
- **Zustand** - State management
- **Axios** - HTTP client
- **React Router** - Routing
- **React Hot Toast** - Notifications
- **Google OAuth 2.0** - Authentication

---

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd FE_EVBSSMS
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Google OAuth 2.0

#### Bước 1: Tạo Google OAuth Client ID

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Vào **APIs & Services** → **Credentials**
4. Tạo **OAuth 2.0 Client ID** (Web application)
5. Thêm **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:3000
   ```
6. Copy **Client ID**

📖 **Xem hướng dẫn chi tiết:** [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

#### Bước 2: Tạo file `.env`

Tạo file `.env` trong thư mục gốc:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:8080/api
```

**⚠️ Lưu ý:** Thay `your-client-id` bằng Client ID thực tế từ Google Cloud Console.

### 4. Chạy development server

```bash
npm run dev
```

Mở browser: http://localhost:5173

---

## 🏗️ Cấu trúc thư mục

```
src/
├── api/              # API clients & services
│   ├── authApi.js
│   ├── adminApi.js
│   ├── userApi.js
│   └── ...
├── components/       # Reusable components
│   ├── ui/          # Shadcn UI components
│   └── ...
├── pages/           # Page components
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── VerifyOTPPage.jsx
│   ├── driver/
│   ├── staff/
│   └── admin/
├── routes/          # Routing configuration
├── store/           # Zustand stores
├── hooks/           # Custom hooks
├── layouts/         # Layout components
└── utils/           # Utility functions
```

---

## 🔐 Authentication Flow

1. **Đăng ký:**
   - Người dùng đăng nhập bằng Google
   - Điền thông tin bổ sung (số điện thoại, CCCD, v.v.)
   - Hệ thống gửi OTP qua email

2. **Xác thực OTP:**
   - Nhập mã OTP từ email
   - Status chuyển từ `PENDING_VERIFICATION` → `ACTIVE`

3. **Đăng nhập:**
   - Đăng nhập bằng tài khoản Google đã đăng ký
   - Redirect theo role (ADMIN/STAFF/DRIVER)

---

## 📝 Scripts

```bash
# Development
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

---

## 🌐 Roles & Routes

| Role   | Route               | Mô tả                    |
|--------|---------------------|--------------------------|
| DRIVER | /driver/dashboard   | Dashboard tài xế         |
| STAFF  | /staff/dashboard    | Dashboard nhân viên      |
| ADMIN  | /admin/dashboard    | Dashboard quản trị viên  |

---

## 🔧 Troubleshooting

### Lỗi Google OAuth: `origin_mismatch`

**Nguyên nhân:** Origin chưa được thêm vào Google Cloud Console

**Giải pháp:**
1. Vào Google Cloud Console → Credentials
2. Chọn OAuth 2.0 Client ID
3. Thêm `http://localhost:5173` vào **Authorized JavaScript origins**
4. Save và restart dev server

**Xem thêm:** [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

### Lỗi "GOOGLE_CLIENT_ID chưa được cấu hình"

1. Tạo file `.env` trong thư mục gốc
2. Thêm `VITE_GOOGLE_CLIENT_ID=your-client-id`
3. Restart dev server

---

## 📚 Tài liệu

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

---

## 👥 Actors

- **ADMIN:** Quản trị viên hệ thống
- **STAFF:** Nhân viên trạm đổi pin
- **DRIVER:** Tài xế sử dụng dịch vụ

---

## 📄 License

MIT
