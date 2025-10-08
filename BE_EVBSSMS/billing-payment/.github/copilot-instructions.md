# 🧭 Hướng dẫn sử dụng Copilot Chat cho dự án Web
Hướng dẫn cho Copilot: Hệ thống Quản lý Trạm Đổi Pin EV (EV Battery Swap Station Management System)
Tài liệu này là kim chỉ nam để phát triển dự án. Mọi đoạn code được tạo ra phải tuân thủ nghiêm ngặt các quy tắc và quy ước được nêu dưới đây.
## 🎯 Vai trò
Bạn là một Software Engineer giàu kinh nghiệm, chuyên phát triển hệ thống web
EV Battery Swap Station Management System Phần mềm quản lý trạm đổi pin xe điện" Actors: "EV Driver BSS Staff Admin" "1. Chức năng cho Tài xế (EV Driver) a. Đăng ký & quản lý tài khoản + Đăng ký dịch vụ đổi pin. + Liên kết phương tiện (VIN, loại pin). b. Đặt lịch & tra cứu trạm đổi pin + Tìm kiếm trạm gần nhất, tình trạng pin sẵn có. + Đặt lịch trước để đảm bảo có pin đầy. c. Thanh toán & gói dịch vụ + Thanh toán theo lượt, hoặc theo gói thuê pin. + Quản lý hóa đơn, lịch sử giao dịch. + Theo dõi số lần đổi pin, chi phí. d. Hỗ trợ & phản hồi + Gửi yêu cầu hỗ trợ khi gặp sự cố pin hoặc trạm. + Đánh giá dịch vụ trạm đổi pin." "2. Chức năng cho Nhân viên Trạm đổi pin (Battery Swap Station Staff) a. Quản lý tồn kho pin + Theo dõi số lượng pin đầy, pin đang sạc, pin bảo dưỡng. + Phân loại theo dung lượng, model, tình trạng. b. Quản lý giao dịch đổi pin + Xác nhận đổi pin, ghi nhận lịch sử giao dịch. + Ghi nhận thanh toán tại chỗ phí đổi pin. + Kiểm tra và ghi nhận tình trạng pin trả về." "3. Chức năng cho Quản trị (Admin) a. Quản lý trạm + Theo dõi lịch sử sử dụng & trạng thái sức khỏe (SoH – State of Health). + Điều phối pin giữa các trạm. + Xử lý khiếu nại & đổi pin lỗi. b. Quản lý người dùng & gói thuê + Quản lý khách hàng. + Tạo gói thuê pin. + Phân quyền nhân viên trạm đổi pin. c. Báo cáo & thống kê + Doanh thu, số lượt đổi pin. + Báo cáo tần suất dổi pin, giờ cao điểm. + AI gợi ý dự báo nhu cầu sử dụng trạm đổi pin để nâng cấp hạ tầng."
Dùng cấu trúc Microservice
Chia nhỏ các service theo chức năng nghiệp vụ
| Service gộp   | Bao gồm chức năng từ các service cũ            | Đáp ứng nhóm chức năng            |
| ------------- | ---------------------------------------------- | --------------------------------- |
| **auth-user** | auth-user + admin                              | Tài khoản, profile, nhân viên     |
| **station**   | station-inventory + geo-routing                | Quản lý trạm, tồn kho, geo        |
| **booking**   | booking-swap + support-feedback + notification | Đặt lịch, đổi pin, hỗ trợ, notify |
| **billing**   | billing-payment + analytics                    | Thanh toán, báo cáo, AI           |
| **gateway**   | api-gateway                                    | Route API                         |


1. auth-user

Đăng ký/đăng nhập (driver/staff/admin)

Quản lý profile, phương tiện

Phân quyền, quản lý nhân viên, trạm, gói thuê

Xử lý khiếu nại/khiếu kiện

2. station

Quản lý trạm, slot, pin, model, SoH

Tìm kiếm trạm gần nhất, geo, routing

3. booking

Đặt lịch, giữ pin, đổi pin

Xử lý giao dịch, support ticket, rating

Gửi notification (email, SMS, push)

4. billing

Quản lý thanh toán, hóa đơn, gói thuê

Báo cáo, thống kê, AI forecast

5. gateway

Route API, auth, monitoring


. Mục tiêu là xây dựng một hệ thống Web quản lý trạm đổi pin xe điện Vinfast.


---

## 🧱 Nguyên tắc chung

1. **TUÂN THỦ THIẾT KẾ CHI TIẾT**
   - Luôn luôn tuân theo các tài liệu thiết kế chi tiết (Detailed Design).
   - Nếu có bất kỳ sự mơ hồ nào, hãy bám sát cấu trúc và quy ước đã được định nghĩa trong tài liệu.

2. **NGÔN NGỮ PHẢN HỒI**
   - Luôn phản hồi, giải thích và viết comment hoàn toàn bằng **Tiếng Việt**.
     💡 Lưu ý: **Luôn luôn** trả lời **bằng tiếng Việt**, **kể cả khi prompt được viết bằng tiếng Anh.**

3. **CÔNG NGHỆ CHÍNH**
   - **Backend**: Java 21, Spring Boot 3.x, Hibernate, MySQL
   - **Frontend**: React 19, Vite, TypeScript
   - **DevOps**: GitHub Actions, AWS

4. **BẢO MẬT**
   - Luôn áp dụng các biện pháp bảo mật như chống SQL Injection, CSRF, XSS.
   - Sử dụng Spring Security để kiểm soát xác thực và phân quyền.
   - Mọi tính năng mới đều phải được xem xét dưới góc độ bảo mật ngay từ đầu.

5. **HIỆU NĂNG**
   - ƯU TIÊN SỰ RÕ RÀNG: Code phải rõ ràng, dễ đọc, và dễ bảo trì hơn là code thông minh nhưng khó hiểu.
   - Code rõ ràng, dễ đọc, dễ mở rộng. Ưu tiên hiệu suất khi truy vấn dữ liệu và gọi API.
6. **KIỂM THỬ**
   - Viết unit test và integration test cho các thành phần quan trọng đảm bảo có thể test đầy đủ các chức năng báo cáo vấn đề kịp thời.
   - Viết Unit Test cho các lớp Service bằng JUnit 5 và Mockito.
   - Viết Integration Test cho các API endpoint để kiểm tra luồng hoạt động hoàn chỉnh.
   - Sử dụng JUnit và Mockito cho backend, Jest và React Testing Library cho frontend.
   - Mục tiêu: Phấn đấu đạt độ bao phủ test (test coverage) cao cho các logic nghiệp vụ quan trọng để đảm bảo chất lượng và phát hiện lỗi sớm.

---

## Kiến trúc Microservice
Hệ thống được chia thành các service độc lập, mỗi service chịu trách nhiệm cho một miền nghiệp vụ cụ thể.
Mỗi service có thể được phát triển, triển khai và mở rộng độc lập.
Mỗi service có cơ sở dữ liệu riêng để đảm bảo tính độc lập và tránh phụ thuộc chặt chẽ.
Các service giao tiếp với nhau thông qua API REST hoặc message broker (nếu cần).
auth-user-service: (Dịch vụ Xác thực & Người dùng)

Chịu trách nhiệm chính: Quản lý tất cả các khía cạnh liên quan đến người dùng và định danh.

Chức năng: Đăng ký, đăng nhập (cho EV Driver, Staff, Admin), quản lý thông tin cá nhân (profile), quản lý phương tiện của người dùng.

Phân quyền: Quản lý vai trò (roles) và quyền hạn (permissions), quản lý nhân viên.

Hỗ trợ: Xử lý các yêu cầu hỗ trợ ban đầu, khiếu nại liên quan đến tài khoản.

station-service: (Dịch vụ Trạm & Pin)

Chịu trách nhiệm chính: Quản lý toàn bộ thông tin về cơ sở vật chất.

Chức năng: Quản lý trạm đổi pin, các ngăn chứa pin (slot), thông tin chi tiết của từng viên pin (model, dung lượng, trạng thái sức khỏe - SoH).

Vị trí: Cung cấp API tìm kiếm trạm gần nhất dựa trên tọa độ (Geolocation), gợi ý lộ trình.

Tồn kho: Theo dõi và cập nhật trạng thái pin (đầy, đang sạc, cần bảo dưỡng, lỗi).

booking-service: (Dịch vụ Đặt lịch & Giao dịch)

Chịu trách nhiệm chính: Xử lý toàn bộ quy trình nghiệp vụ đổi pin.

Chức năng: Tạo và quản lý lịch đặt trước, xử lý logic đổi pin tại trạm, xác nhận giao dịch.

Tương tác người dùng: Quản lý các phiếu hỗ trợ (support ticket) liên quan đến giao dịch, cho phép người dùng đánh giá (rating) trạm.

Thông báo: Gửi thông báo (email, SMS, push notification) đến người dùng về trạng thái đặt lịch, giao dịch thành công, nhắc nhở.

billing-service: (Dịch vụ Thanh toán & Báo cáo)

Chịu trách nhiệm chính: Xử lý các vấn đề tài chính và phân tích dữ liệu.

Chức năng: Quản lý các gói thuê bao, xử lý thanh toán (tích hợp với bên thứ ba), tạo và quản lý hóa đơn.

Báo cáo: Cung cấp các báo cáo, thống kê về doanh thu, số lượt đổi pin, tần suất sử dụng, giờ cao điểm.

Phân tích AI: Xây dựng mô hình dự báo nhu cầu sử dụng pin tại các trạm để đưa ra gợi ý về việc điều phối pin và nâng cấp hạ tầng.

api-gateway: (Cổng API)

Chịu trách nhiệm chính: Là điểm vào (entry point) duy nhất cho tất cả các yêu cầu từ client.

Chức năng: Định tuyến (route) các API request đến service tương ứng, xác thực token (JWT), giám sát (monitoring) lưu lượng truy cập, và thực hiện rate limiting để chống tấn công DoS/DDoS.

## ☕ Hướng dẫn cho Java + Spring Boot
- Java 21 & Spring Boot 3.x

- Mọi Controller cần trả về `ResponseEntity`.
- Tuân thủ phân tầng `Controller → Service → Repository`.
- Sử dụng `@Transactional` đúng chỗ để đảm bảo toàn vẹn dữ liệu.
- Không viết logic nghiệp vụ trong Controller.
- Xử lý lỗi toàn cục bằng `@ControllerAdvice`.
- Sử dụng DTO để tách biệt giữa entity và dữ liệu phản hồi.
- Repository nên mở rộng từ `JpaRepository` và áp dụng Query Method.
- Không hardcode cấu hình, dùng `application.yml` với cấu trúc rõ ràng.
- Tự động validate bằng `@Valid`, `@NotNull`, v.v.
- Controller:

Chỉ làm nhiệm vụ nhận request, validate input và trả về ResponseEntity.

Không chứa logic nghiệp vụ.

Sử dụng DTO (Data Transfer Object) để nhận dữ liệu từ request và trả về response. Tách biệt hoàn toàn Entity khỏi lớp giao tiếp.

Sử dụng validation annotations (@Valid, @NotNull, @Email,...) để kiểm tra dữ liệu đầu vào.

- Service:

Chứa toàn bộ logic nghiệp vụ.

Sử dụng @Transactional trên các phương thức cần đảm bảo toàn vẹn dữ liệu (đặc biệt là các nghiệp vụ ghi, sửa, xóa).

- Repository:

Mở rộng từ JpaRepository.

Ưu tiên sử dụng Query Methods của Spring Data JPA. Đối với các truy vấn phức tạp, sử dụng @Query với JPQL.

- Xử lý lỗi:

Sử dụng @ControllerAdvice và @ExceptionHandler để xử lý exception một cách tập trung và trả về response lỗi nhất quán.

- Cấu hình:

Không hardcode bất kỳ thông tin nhạy cảm nào (database password, API keys,...).

Sử dụng application.yml và Spring Profiles (ví dụ: dev, staging, prod) để quản lý cấu hình cho các môi trường khác nhau.

các thông tin nhạy cảm bỏ vào biến .env và dùng docker-compose để inject vào ứng dụng.
Logging: Sử dụng SLF4J và Logback để ghi log. Ghi log đầy đủ thông tin context khi có lỗi xảy ra.
---
## DevOps
- Sử dụng GitHub Actions để tự động hoá CI/CD.
- Containerization: Đóng gói tất cả các microservice bằng Docker để đảm bảo tính nhất quán giữa các môi trường.
- Deployment: Triển khai ứng dụng trên AWS (ví dụ: EKS cho Kubernetes hoặc ECS cho Docker containers).
## ⚛️ Hướng dẫn cho React 19 + Vite + TypeScript

- Sử dụng Function Component + React Hooks (`useState`, `useEffect`, `useQuery`...).
- Sử dụng React Router v6 cho định tuyến.
- Áp dụng **Tailwind CSS** cho giao diện.
- Gọi API thông qua Axios hoặc React Query (`@tanstack/react-query`).
- Tách các phần như: `components/`, `pages/`, `hooks/`, `services/`, `types/`, `utils/`.
- Luôn gõ rõ `type` và `interface` cho props, state, API response.
- Sử dụng cấu trúc thư mục nhất quán và có test nếu cần.

---

## 🌐 Quy tắc thiết kế RESTful API

### 1. Đặt tên Endpoint
- Dùng danh từ số nhiều: (ví dụ: /users, /stations, /batteries).
- Không dùng động từ trong URI (ví dụ: GET /getUsers là sai, GET /users là đúng).
- Dùng kebab-case: (ví dụ: /battery-swaps, /user-vehicles).

### 2. HTTP Methods
- `GET`: Lấy dữ liệu (an toàn, không thay đổi trạng thái).
- `POST`: Lấy dữ liệu (an toàn, không thay đổi trạng thái).
- `PUT`: Cập nhật toàn bộ thông tin của một resource đã tồn tại.
- `PATCH`: Cập nhật một phần thông tin của một resource.
- `DELETE`: Xoá

### 3. Định dạng dữ liệu
- Luôn sử dụng `Content-Type: application/json`
- JSON key dùng `camelCase`: `firstName`, `batteryModel`

### 4. Status code
- 200 OK, 201 Created, 204 No Content
- 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found
- 500 Internal Server Error
- Đọc trước trong exception/ErrorCode.java và StatusApplication.java trước khi sử dụng status code, nếu có loại code trong đó ưu tiên sử dụng.
- Luôn trả về status code phù hợp với kết quả của request.
- Khi thiết kế code phải có cấu trúc để trả về status code và message cho người dùng.
- Theo cấu trúc "statusCode", "message", "data"
### 5. Cấu trúc Response & Status Code:
```json
- Thành công:
{
  "statusCode": 200,
  "message": "Thao tác thành công!",
  "data": { ... }
}
Sử dụng các status code phù hợp: 200 OK, 201 Created, 204 No Content.


- Lỗi:
QUAN TRỌNG: Trước khi sử dụng status code, hãy kiểm tra các file exception/ErrorCode.java và StatusApplication.java. Ưu tiên sử dụng các mã lỗi đã được định nghĩa sẵn trong đó.
Cấu trúc lỗi chuẩn:
{
  "timestamp": "2025-10-02T10:00:00Z",
  "statusCode": 400,
  "message": "Email không hợp lệ."
}
Sử dụng các status code lỗi phổ biến: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error
