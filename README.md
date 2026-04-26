# Dopaless - Hệ thống Quản lý Bài viết & Quiz Đa tầng

Dopaless là một nền tảng nghiên cứu tâm lý và thần kinh học, cung cấp các bài viết chuyên sâu và các bài kiểm tra (quiz) giúp người dùng hiểu rõ hơn về cơ chế Dopamine và cải thiện năng suất làm việc. Dự án sử dụng mô hình đăng ký thành viên đa tầng (Multi-tier Subscription) để phân quyền truy cập nội dung.

## 🚀 Công nghệ sử dụng

### Backend
- **Framework**: Spring Boot 3.x
- **Bảo mật**: Spring Security, JWT (JSON Web Token)
- **Cơ sở dữ liệu**: MySQL 8.x
- **ORM**: Spring Data JPA
- **Tích hợp**: OAuth2 (Google Login), Cloudinary (Lưu trữ ảnh)

### Frontend
- **Framework**: React.js (Vite)
- **UI/UX**: Vanilla CSS (Custom Premium Design), Lucide React (Icons)
- **Quản lý trạng thái**: React Context API
- **Soạn thảo**: React Quill (Rich Text Editor)
- **Thông báo**: React Hot Toast

## 📂 Cấu trúc thư mục

```text
exe-project/
├── backend/               # Mã nguồn Spring Boot
│   ├── src/main/java/     # Logic nghiệp vụ (Entities, Services, Controllers)
│   └── src/main/resources/# Cấu hình ứng dụng
├── frontend/              # Mã nguồn React (Vite)
│   ├── src/apis/          # Cấu hình gọi API (Axios)
│   ├── src/hooks/         # Custom Hooks & AuthContext
│   ├── src/pages/         # Các trang (Admin & Customer)
│   └── src/routes/        # Cấu hình điều hướng (React Router)
└── database/              # Scripts cơ sở dữ liệu
    ├── ddl.sql            # Cấu trúc bảng
    └── dml.sql            # Dữ liệu mẫu (Dopamine topics)
```

## 💎 Hệ thống phân cấp thành viên (Subscription Tiers)

Dự án triển khai mô hình phân quyền nội dung dựa trên trọng số cấp độ:
1.  **FREE (Cấp 0)**: Truy cập các bài viết kiến thức cơ bản.
2.  **VIP (Cấp 1)**: Truy cập nội dung chuyên sâu và các bài viết VIP. Xem được cả nội dung FREE.
3.  **PREMIUM (Cấp 2)**: Toàn quyền truy cập mọi nội dung, tài liệu đặc biệt và tính năng cao cấp nhất. Xem được cả VIP và FREE.

## 🛠 Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Cơ sở dữ liệu
- Tạo một database trong MySQL (ví dụ: `exe_db`).
- Chạy file `database/ddl.sql` để tạo cấu trúc bảng.
- Chạy file `database/dml.sql` để nạp dữ liệu mẫu (đã bao gồm các bài viết về chủ đề Dopamine).

### 2. Chạy Backend
- Yêu cầu: Java 17+, Maven.
- Cấu hình database trong `backend/src/main/resources/application.properties`.
- Chạy lệnh: `mvn spring-boot:run`

### 3. Chạy Frontend
- Yêu cầu: Node.js 18+.
- Chạy lệnh:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- Truy cập tại: `http://localhost:5173`
