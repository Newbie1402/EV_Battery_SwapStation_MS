package com.boilerplate.station.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum AppException {

    // ================== COMMON ==================
    INTERNAL_SERVER_ERROR("ERR_000", "Lỗi máy chủ nội bộ", HttpStatus.INTERNAL_SERVER_ERROR),
    BAD_REQUEST("ERR_001", "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("ERR_002", "Chưa xác thực", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("ERR_003", "Không có quyền truy cập", HttpStatus.FORBIDDEN),
    NOT_FOUND("ERR_004", "Không tìm thấy tài nguyên", HttpStatus.NOT_FOUND),
    VALIDATION_FAILED("ERR_005", "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),

    // ================== USER / AUTH ==================
    USER_NOT_FOUND("USR_001", "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS("USR_002", "Email đã tồn tại", HttpStatus.BAD_REQUEST),
    PHONE_ALREADY_EXISTS("USR_003", "Số điện thoại đã được sử dụng", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS("USR_004", "Tên đăng nhập hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED),
    ACCOUNT_LOCKED("USR_005", "Tài khoản đã bị khóa", HttpStatus.FORBIDDEN),
    ACCOUNT_INACTIVE("USR_006", "Tài khoản chưa được kích hoạt", HttpStatus.FORBIDDEN),

    // ================== STATION ==================
    STATION_NOT_FOUND("STN_001", "Không tìm thấy trạm đổi pin", HttpStatus.NOT_FOUND),
    STATION_INACTIVE("STN_002", "Trạm đổi pin đang tạm ngưng hoạt động", HttpStatus.BAD_REQUEST),
    STATION_FULL("STN_003", "Trạm đã đầy, không thể nhận thêm pin", HttpStatus.BAD_REQUEST),
    STATION_EMPTY("STN_004", "Trạm không còn pin đầy để đổi", HttpStatus.BAD_REQUEST),

    // ================== BATTERY ==================
    BATTERY_NOT_FOUND("BAT_001", "Không tìm thấy pin", HttpStatus.NOT_FOUND),
    BATTERY_IN_USE("BAT_002", "Pin đang được sử dụng", HttpStatus.BAD_REQUEST),
    BATTERY_DEFECTIVE("BAT_003", "Pin bị lỗi, không thể sử dụng", HttpStatus.BAD_REQUEST),
    BATTERY_MAINTENANCE("BAT_004", "Pin đang trong quá trình bảo dưỡng", HttpStatus.BAD_REQUEST),
    BATTERY_NOT_AVAILABLE("BAT_005", "Không có pin đầy khả dụng tại trạm", HttpStatus.BAD_REQUEST),
    BATTERY_HELD("BAT_006", "Pin đã được giữ cho một yêu cầu đổi khác", HttpStatus.BAD_REQUEST),
    // ================== SWAP / TRANSACTION ==================
    SWAP_NOT_FOUND("SWP_001", "Không tìm thấy lịch sử đổi pin", HttpStatus.NOT_FOUND),
    SWAP_FAILED("SWP_002", "Giao dịch đổi pin thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    SWAP_ALREADY_COMPLETED("SWP_003", "Lượt đổi pin này đã hoàn tất", HttpStatus.BAD_REQUEST),
    INVALID_SWAP_REQUEST("SWP_004", "Yêu cầu đổi pin không hợp lệ", HttpStatus.BAD_REQUEST),
    SWAP_STATION_MISMATCH("SWP_005", "Trạm đổi pin không trùng khớp với yêu cầu", HttpStatus.BAD_REQUEST),

    // ================== PAYMENT ==================
    PAYMENT_FAILED("PAY_001", "Thanh toán thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    PAYMENT_NOT_FOUND("PAY_002", "Không tìm thấy giao dịch thanh toán", HttpStatus.NOT_FOUND),
    PAYMENT_PENDING("PAY_003", "Thanh toán đang được xử lý", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_BALANCE("PAY_004", "Số dư không đủ để thực hiện giao dịch", HttpStatus.BAD_REQUEST),

    // ================== PACKAGE / SUBSCRIPTION ==================
    PACKAGE_NOT_FOUND("PKG_001", "Không tìm thấy gói thuê pin", HttpStatus.NOT_FOUND),
    PACKAGE_EXPIRED("PKG_002", "Gói thuê pin đã hết hạn", HttpStatus.BAD_REQUEST),
    PACKAGE_LIMIT_REACHED("PKG_003", "Đã đạt giới hạn đổi pin trong gói", HttpStatus.BAD_REQUEST),

    // ================== SUPPORT / FEEDBACK ==================
    SUPPORT_REQUEST_NOT_FOUND("SUP_001", "Không tìm thấy yêu cầu hỗ trợ", HttpStatus.NOT_FOUND),
    FEEDBACK_NOT_FOUND("FDB_001", "Không tìm thấy phản hồi", HttpStatus.NOT_FOUND),

    // ================== SUCCESS ==================
    SUCCESS("SUC_200", "Thành công", HttpStatus.OK),
    CREATED("SUC_201", "Đã tạo mới thành công", HttpStatus.CREATED);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    AppException(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

}
