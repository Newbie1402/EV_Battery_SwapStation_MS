package com.boilerplate.bookingswap.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum BookingException {

    // ================== COMMON ==================
    INTERNAL_SERVER_ERROR("BKG_000", "Lỗi máy chủ nội bộ (Booking Service)", HttpStatus.INTERNAL_SERVER_ERROR),
    BAD_REQUEST("BKG_001", "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("BKG_002", "Chưa xác thực", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("BKG_003", "Không có quyền truy cập", HttpStatus.FORBIDDEN),
    NOT_FOUND("BKG_004", "Không tìm thấy tài nguyên", HttpStatus.NOT_FOUND),
    VALIDATION_FAILED("BKG_005", "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),

    // ================== BOOKING ==================
    BOOKING_NOT_FOUND("BKG_101", "Không tìm thấy lịch đặt", HttpStatus.NOT_FOUND),
    BOOKING_ALREADY_EXISTS("BKG_102", "Lịch đặt đã tồn tại", HttpStatus.BAD_REQUEST),
    BOOKING_SLOT_UNAVAILABLE("BKG_103", "Khung giờ đặt không còn trống", HttpStatus.BAD_REQUEST),
    BOOKING_STATION_NOT_AVAILABLE("BKG_104", "Trạm không sẵn sàng để đặt lịch", HttpStatus.BAD_REQUEST),
    BOOKING_ALREADY_COMPLETED("BKG_105", "Lịch đặt đã hoàn thành", HttpStatus.BAD_REQUEST),
    BOOKING_ALREADY_CANCELED("BKG_106", "Lịch đặt đã bị hủy", HttpStatus.BAD_REQUEST),
    BOOKING_CANCEL_FAILED("BKG_107", "Hủy lịch đặt thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    BOOKING_UPDATE_NOT_ALLOWED("BKG_108", "Không thể cập nhật lịch đặt ở trạng thái hiện tại", HttpStatus.BAD_REQUEST),

    // ================== CUSTOMER ==================
    CUSTOMER_NOT_FOUND("BKG_201", "Không tìm thấy khách hàng", HttpStatus.NOT_FOUND),
    CUSTOMER_INACTIVE("BKG_202", "Tài khoản khách hàng không hoạt động", HttpStatus.BAD_REQUEST),

    // ================== STATION / SLOT ==================
    STATION_NOT_FOUND("BKG_301", "Không tìm thấy trạm", HttpStatus.NOT_FOUND),
    STATION_INACTIVE("BKG_302", "Trạm không hoạt động", HttpStatus.BAD_REQUEST),

    SLOT_NOT_FOUND("BKG_303", "Không tìm thấy slot", HttpStatus.NOT_FOUND),
    SLOT_ALREADY_BOOKED("BKG_304", "Slot này đã có người đặt", HttpStatus.BAD_REQUEST),
    SLOT_OUT_OF_SERVICE("BKG_305", "Slot đang bảo trì hoặc tạm ngừng hoạt động", HttpStatus.BAD_REQUEST),

    // ================== PAYMENT (nếu booking có thanh toán) ==================
    PAYMENT_REQUIRED("BKG_401", "Cần thanh toán trước khi xác nhận booking", HttpStatus.BAD_REQUEST),
    PAYMENT_NOT_FOUND("BKG_402", "Không tìm thấy thông tin thanh toán của booking", HttpStatus.NOT_FOUND),
    PAYMENT_MISMATCH("BKG_403", "Thông tin thanh toán không khớp với booking", HttpStatus.BAD_REQUEST),

    // ================== SYSTEM / SYNC ==================
    BOOKING_SYNC_FAILED("BKG_501", "Đồng bộ dữ liệu booking thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    BOOKING_CALCULATION_ERROR("BKG_502", "Lỗi khi tính toán thời gian/slot", HttpStatus.INTERNAL_SERVER_ERROR),

    // ================== SUCCESS ==================
    SUCCESS("SUC_200", "Thành công", HttpStatus.OK),
    CREATED("SUC_201", "Đã tạo mới thành công", HttpStatus.CREATED);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    BookingException(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
