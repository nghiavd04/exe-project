# Dopaless

Dopaless là nền tảng hỗ trợ người dùng đánh giá và cải thiện thói quen sử dụng thiết bị số. Hệ thống kết hợp bài viết, bài trắc nghiệm, phác đồ cá nhân hóa, theo dõi tiến độ, AI chat và các gói thành viên trên cùng một ứng dụng web.

## Tính năng chính

### Dành cho người dùng

- Đăng ký, đăng nhập bằng email hoặc Google OAuth2; xác thực email và đặt lại mật khẩu.
- Đọc bài viết theo danh mục và cấp thành viên.
- Làm bài trắc nghiệm, nhận kết quả đánh giá và phác đồ phù hợp.
- Theo dõi phác đồ theo ngày/tuần, hoàn thành nhiệm vụ, ghi nhật ký và xem số liệu tiến độ.
- Tải ảnh thời gian sử dụng màn hình và trích xuất dữ liệu bằng OCR tiếng Việt/Anh.
- Trò chuyện với AI hoặc nhân viên hỗ trợ theo thời gian thực.
- Nhận thông báo, quản lý hồ sơ và nâng cấp gói qua PayOS.

### Dành cho quản trị viên

- Dashboard thống kê người dùng, doanh thu và hoạt động hệ thống.
- Quản lý bài viết, quiz, câu hỏi, quy tắc đánh giá và phân tích lượt làm bài.
- Quản lý người dùng, gói thành viên, giao dịch và nội dung phác đồ.
- Quản lý thư viện media, tin nhắn liên hệ và gửi thông báo hàng loạt.
- Theo dõi phiên AI chat, tiếp quản cuộc hội thoại và cấu hình prompt.

## Công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React 19, Vite 8, React Router, Axios, STOMP WebSocket, Tailwind CSS 4 và CSS thuần |
| Backend | Java 21, Spring Boot 4, Spring Security, Spring Data JPA, JWT, OAuth2 |
| Dữ liệu | MySQL 8, Redis |
| Tích hợp | Google OAuth2, Gemini, Cloudinary, PayOS, SMTP |
| Xử lý ảnh | Tess4J/Tesseract OCR (`vie`, `eng`) |
| Triển khai | Docker, Docker Compose, Caddy |

## Kiến trúc tổng quan

```text
Trình duyệt
    |
    v
React/Vite (frontend)
    |  REST + WebSocket/STOMP
    v
Spring Boot (backend)
    |-- MySQL       : dữ liệu nghiệp vụ
    |-- Redis       : cache/trạng thái tạm
    |-- Gemini      : AI chat và gợi ý nội dung
    |-- Cloudinary  : lưu trữ ảnh/media
    |-- PayOS       : thanh toán gói thành viên
    `-- Tesseract   : OCR ảnh thời gian màn hình
```

Backend cung cấp API dưới các namespace chính:

- `/api/auth`: xác thực và khôi phục tài khoản.
- `/api/v1/customer`: chức năng dành cho người dùng.
- `/api/v1/admin`: chức năng quản trị.
- `/api/ws-chat`: endpoint WebSocket cho chat thời gian thực.

## Cấu trúc dự án

```text
exe-project/
|-- backend/
|   |-- src/main/java/          # Controller, service, repository, entity, security
|   |-- src/main/resources/     # Cấu hình và dữ liệu khởi tạo phác đồ
|   |-- src/test/               # Kiểm thử backend
|   |-- tessdata/               # Dữ liệu ngôn ngữ OCR
|   `-- Dockerfile
|-- frontend/
|   |-- src/apis/               # Các client gọi API
|   |-- src/components/         # Component dùng chung
|   |-- src/hooks/              # Auth context và custom hooks
|   |-- src/layouts/            # Layout customer/admin
|   |-- src/pages/              # Các màn hình nghiệp vụ
|   |-- src/routes/             # Khai báo route và bảo vệ quyền truy cập
|   `-- Dockerfile
|-- tessdata/                    # Dữ liệu OCR dùng khi chạy từ thư mục gốc
|-- Caddyfile                    # Reverse proxy cho môi trường triển khai
`-- docker-compose.yml
```

## Yêu cầu

- Java 21.
- Node.js 22 và npm.
- MySQL 8.
- Redis.
- Tesseract OCR với gói ngôn ngữ `eng` và `vie` nếu chạy backend trực tiếp trên máy.
- Docker và Docker Compose nếu chạy hạ tầng hoặc triển khai bằng container.

## Chạy trên máy local

### 1. Khởi động MySQL và Redis

Có thể dùng hai service có sẵn trong Compose:

```bash
docker compose up -d mysql redis
```

Mặc định MySQL chạy tại `localhost:3306`, database `dopaless_db`; Redis chạy tại `localhost:6379`.

> Backend dùng `spring.jpa.hibernate.ddl-auto=update`, vì vậy Hibernate tự cập nhật schema. Khi khởi động, `DataInitializer` cũng nạp gói FREE và metadata của các phác đồ từ `backend/src/main/resources`; không cần chạy thủ công các file SQL cũ.

### 2. Cấu hình backend

Tạo file `backend/.env` (file này đã được `.gitignore`) và điền các biến cần dùng:

```dotenv
DB_URL=jdbc:mysql://localhost:3306/dopaless_db
DB_USERNAME=root
DB_PASSWORD=root
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=

PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
PAYMENT_RETURN_URL=http://localhost:5173/payment-success
PAYMENT_CANCEL_URL=http://localhost:5173/payment-cancel

GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash
```

Các khóa cấu hình trên nên luôn có mặt trong file `.env` để Spring khởi tạo context; với tích hợp chưa sử dụng, có thể tạm để giá trị rỗng. Chức năng tương ứng chỉ hoạt động khi thông tin xác thực hợp lệ. Có thể dùng `GEMINI_API_KEYS` (danh sách phân tách bằng dấu phẩy) thay cho một khóa đơn để luân phiên khóa.

Không commit khóa bí mật vào repository. Ở môi trường thật, hãy dùng mật khẩu database và `JWT_SECRET` riêng, đủ mạnh.

### 3. Chạy backend

Trên Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Trên macOS/Linux:

```bash
cd backend
./mvnw spring-boot:run
```

Backend mặc định phục vụ tại `http://localhost:8080`.

### 4. Chạy frontend

Mở terminal khác:

```bash
cd frontend
npm install
npm run dev
```

Truy cập `http://localhost:5173`. Vite tự proxy `/api` và các request OAuth2 sang backend ở cổng `8080`.

## Kiểm tra và build

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

### Backend

Đảm bảo MySQL, Redis đang chạy và các biến trong `backend/.env` đã được khai báo trước khi chạy test tích hợp.

Windows:

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd clean package
```

macOS/Linux:

```bash
cd backend
./mvnw test
./mvnw clean package
```

## Triển khai bằng Docker Compose

File `docker-compose.yml` hiện được cấu hình cho domain `dopaless.cloud` và sử dụng image đã build sẵn trên Docker Hub. Trước khi chạy, cần khai báo các biến tích hợp trong file `.env` ở thư mục gốc:

```dotenv
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MAIL_USERNAME=
MAIL_PASSWORD=
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
PAYMENT_RETURN_URL=https://dopaless.cloud/payment-success
PAYMENT_CANCEL_URL=https://dopaless.cloud/payment-cancel
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash
```

Sau đó chạy:

```bash
docker compose up -d
docker compose ps
docker compose logs -f backend
```

Caddy đảm nhiệm HTTPS và reverse proxy: request `/api`, `/oauth2/authorize` và `/login/oauth2` được chuyển tới backend; các request còn lại được chuyển tới frontend. Nếu dùng domain khác, cập nhật đồng thời `Caddyfile`, `FRONTEND_URL`, `BACKEND_URL` và redirect URI đã đăng ký với Google OAuth2.

## Phân quyền và gói thành viên

Hệ thống có hai vai trò `CUSTOMER` và `ADMIN`. Nội dung/tính năng dành cho khách hàng được phân tầng theo thứ tự:

1. `FREE`
2. `BASIC`
3. `PREMIUM`
4. `ELITE`

Cấp cao hơn có trọng số quyền truy cập lớn hơn. Route quản trị yêu cầu tài khoản có vai trò `ADMIN`; các trang hồ sơ, làm quiz và phác đồ yêu cầu đăng nhập.

## Ghi chú

- Backend không tích hợp Swagger/OpenAPI ở thời điểm hiện tại; xem các controller trong `backend/src/main/java/com/product/exe/backend/controller` để biết hợp đồng API.
- Thư mục `uploads/` chứa file tải lên local; ảnh/media chính có thể được lưu qua Cloudinary tùy luồng nghiệp vụ.
- Cấu hình production trong Compose chỉ nên dùng làm mẫu ban đầu. Hãy thay thông tin xác thực mặc định và quản lý secret bằng biến môi trường hoặc secret manager trước khi triển khai công khai.
