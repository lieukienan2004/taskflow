# TaskFlow — Hệ thống Quản lý Công việc Cá nhân

## Mục tiêu

TaskFlow là ứng dụng web quản lý công việc cá nhân dành cho sinh viên, tích hợp trí tuệ nhân tạo Google Gemini và kỹ thuật gamification để tăng hiệu quả quản lý thời gian và duy trì động lực sử dụng.

## Kiến trúc hệ thống

Kiến trúc 3 tầng (Client-Server-Database):

```
Frontend (Vue 3 + Vite)  →  Backend (Node.js + Express)  →  Database (MySQL / TiDB Cloud)
         ↓                          ↓                              ↓
  Pinia, Chart.js              JWT Auth, Socket.IO            20 bảng, RESTful API
  Capacitor (APK)              Google Gemini API
```

## Cấu trúc thư mục

```
├── backend/                    # Mã nguồn phía server
│   ├── src/
│   │   ├── config/             # Cấu hình database, environment
│   │   ├── controllers/        # Xử lý logic API
│   │   ├── middleware/         # Xác thực JWT, phân quyền
│   │   ├── models/            # Truy vấn database
│   │   ├── routes/            # Định nghĩa API endpoints
│   │   ├── utils/             # Hàm tiện ích
│   │   └── socketHandler.js   # Real-time Socket.IO
│   └── server.js              # Entry point server
├── frontend/                   # Mã nguồn phía client
│   ├── src/
│   │   ├── api/               # Axios API client
│   │   ├── assets/            # CSS, hình ảnh
│   │   ├── components/        # Component tái sử dụng
│   │   ├── router/            # Vue Router (hash mode)
│   │   ├── stores/            # Pinia state management
│   │   └── views/             # Các trang giao diện
│   ├── capacitor.config.json  # Cấu hình APK Android
│   └── vite.config.js         # Cấu hình Vite
├── images/                     # Hình ảnh tài liệu
├── word/                       # Word khóa luận
├── ppt-screenshots/            # Ảnh chụp PPT
├── render.yaml                 # Cấu hình deploy Render.com
└── README.md
```

## Phần mềm cần thiết

### Yêu cầu cài đặt

| Phần mềm | Phiên bản | Ghi chú |
|-----------|-----------|---------|
| Node.js | >= 18.x | Runtime JavaScript |
| npm | >= 9.x | Package manager |
| MySQL | >= 8.0 | Hoặc dùng TiDB Cloud (miễn phí) |
| Git | >= 2.x | Version control |

### Tài khoản dịch vụ (miễn phí)

- **TiDB Cloud**: https://tidbcloud.com — Database cloud MySQL-compatible
- **Render.com**: https://render.com — Deploy backend + frontend
- **Google AI Studio**: https://aistudio.google.com — API key Gemini

## Cách chạy chương trình

### 1. Clone repository

```bash
git clone https://github.com/lieukienan2004/taskflow.git
cd taskflow
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=taskflow
DB_SSL=false
JWT_SECRET=taskflow-secret-key
GEMINI_API_KEY=your-gemini-api-key
PORT=3001
```

Khởi động server:

```bash
node server.js
```

Server chạy tại: `http://localhost:3001`

### 3. Cài đặt Frontend

```bash
cd frontend
npm install
```

Khởi động development server:

```bash
npx vite --port 5173
```

Frontend chạy tại: `http://localhost:5173`

### 4. Tài khoản mặc định

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| Admin | admin@taskflow.com | password |
| User | Tạo tài khoản mới | — |

### 5. Deploy lên Render.com (tùy chọn)

```bash
# Backend: tạo Web Service trên Render, link repo backend/
# Frontend: tạo Static Site trên Render, link repo frontend/
# Database: dùng TiDB Cloud free tier
```

## Tính năng chính

### Người dùng
- Dashboard tổng quan công việc
- Quản lý nhiệm vụ (Kanban Board, kéo thả)
- Pomodoro Timer 25/5 phút
- Quản lý dự án, lịch, GPA, ghi chú, mục tiêu OKR
- Trợ lý AI Gemini: tạo task, phân rã subtask, chatbot cố vấn
- Gamification: XP, Level, Badge, Streak, Leaderboard
- Responsive: Desktop + Mobile + APK Android

### Quản trị viên
- Quản lý người dùng, dự án, danh mục
- Theo dõi nhật ký hoạt động
- Thống kê hệ thống, xuất dữ liệu

## Công nghệ sử dụng

| Lớp | Công nghệ |
|-----|-----------|
| Frontend | Vue 3, Vite, Pinia, Chart.js, Axios |
| Backend | Node.js, Express, Socket.IO, JWT |
| Database | MySQL 8.0 (TiDB Cloud) |
| AI | Google Gemini API (Function Calling) |
| Mobile | Capacitor (Android APK) |
| Deploy | Render.com, TiDB Cloud |

## Tác giả

- **Liễu Kiện An** — MSSV: 110122028
- **Đại học Trà Vinh** — Khoa Kỹ thuật & Công nghệ
- **Giáo viên hướng dẫn**: ThS. Nguyễn Khắc Quốc
