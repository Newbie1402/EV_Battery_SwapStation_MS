package com.boilerplate.billing.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum BillingException {

    // ================== COMMON ==================
    INTERNAL_SERVER_ERROR("BIL_000", "Lỗi máy chủ nội bộ (Billing Service)", HttpStatus.INTERNAL_SERVER_ERROR),
    BAD_REQUEST("BIL_001", "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("BIL_002", "Chưa xác thực", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("BIL_003", "Không có quyền truy cập", HttpStatus.FORBIDDEN),
    NOT_FOUND("BIL_004", "Không tìm thấy tài nguyên", HttpStatus.NOT_FOUND),
    VALIDATION_FAILED("BIL_005", "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_PAYMENT_AMOUNT("BIL_006", "Số tiền thanh toán không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_SECURE_HASH("BIL_007", "Chữ ký bảo mật không hợp lệ", HttpStatus.BAD_REQUEST),
    // ================== PAYMENT ==================
    PAYMENT_FAILED("PAY_001", "Thanh toán thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    PAYMENT_NOT_FOUND("PAY_002", "Không tìm thấy giao dịch thanh toán", HttpStatus.NOT_FOUND),
    PAYMENT_PENDING("PAY_003", "Thanh toán đang được xử lý", HttpStatus.BAD_REQUEST),
    PAYMENT_ALREADY_COMPLETED("PAY_004", "Giao dịch thanh toán đã được xử lý", HttpStatus.BAD_REQUEST),
    PAYMENT_GATEWAY_ERROR("PAY_005", "Lỗi từ cổng thanh toán (VNPAY, MOMO...)", HttpStatus.BAD_GATEWAY),
    PAYMENT_REFUND_FAILED("PAY_006", "Hoàn tiền thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    INSUFFICIENT_FUNDS("PAY_007", "Số dư tài khoản không đủ để thanh toán", HttpStatus.BAD_REQUEST),

    // === NEW: Lỗi VNPAY chi tiết ===
    INVALID_SIGNATURE("PAY_008", "Chữ ký xác thực VNPAY không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_PAYMENT_TYPE("PAY_009", "Loại thanh toán không hợp lệ (package/swap)", HttpStatus.BAD_REQUEST),
    INVALID_ORDER_INFO("PAY_010", "Thông tin đơn hàng không hợp lệ hoặc sai định dạng", HttpStatus.BAD_REQUEST),
    VNPAY_CALLBACK_ERROR("PAY_011", "Lỗi khi xử lý callback từ VNPAY", HttpStatus.INTERNAL_SERVER_ERROR),
    VNPAY_URL_GENERATION_FAILED("PAY_012", "Không thể tạo URL thanh toán VNPAY", HttpStatus.INTERNAL_SERVER_ERROR),

    // ================== PACKAGE / SUBSCRIPTION ==================
    PACKAGE_NOT_FOUND("PKG_001", "Không tìm thấy gói thuê pin", HttpStatus.NOT_FOUND),
    PACKAGE_EXPIRED("PKG_002", "Gói thuê pin đã hết hạn", HttpStatus.BAD_REQUEST),
    PACKAGE_LIMIT_REACHED("PKG_003", "Đã đạt giới hạn lượt đổi pin trong gói", HttpStatus.BAD_REQUEST),
    PACKAGE_INACTIVE("PKG_004", "Gói thuê pin chưa được kích hoạt", HttpStatus.BAD_REQUEST),
    PACKAGE_ALREADY_ACTIVE("PKG_005", "Gói thuê pin đã được kích hoạt", HttpStatus.BAD_REQUEST),
    PACKAGE_EXTENSION_FAILED("PKG_006", "Gia hạn gói thuê pin thất bại", HttpStatus.INTERNAL_SERVER_ERROR),

    // ================== INVOICE ==================
    INVOICE_NOT_FOUND("INV_001", "Không tìm thấy hóa đơn", HttpStatus.NOT_FOUND),
    INVOICE_GENERATION_FAILED("INV_002", "Không thể tạo hóa đơn", HttpStatus.INTERNAL_SERVER_ERROR),
    INVOICE_ALREADY_ISSUED("INV_003", "Hóa đơn đã được phát hành", HttpStatus.BAD_REQUEST),
    INVOICE_PAYMENT_MISMATCH("INV_004", "Thông tin thanh toán không khớp với hóa đơn", HttpStatus.BAD_REQUEST),

    // ================== SUBSCRIPTION ==================
    SUBSCRIPTION_NOT_FOUND("SUB_001", "Không tìm thấy đăng ký thuê gói", HttpStatus.NOT_FOUND),
    SUBSCRIPTION_EXPIRED("SUB_002", "Đăng ký thuê gói đã hết hạn", HttpStatus.BAD_REQUEST),
    SUBSCRIPTION_ALREADY_ACTIVE("SUB_003", "Đăng ký thuê gói đã hoạt động", HttpStatus.BAD_REQUEST),
    SUBSCRIPTION_NOT_ACTIVE("SUB_004", "Đăng ký thuê gói chưa được kích hoạt", HttpStatus.BAD_REQUEST),

    // ================== BILLING OPERATION ==================
    BILLING_RECORD_NOT_FOUND("BIL_101", "Không tìm thấy bản ghi thanh toán", HttpStatus.NOT_FOUND),
    BILLING_SYNC_FAILED("BIL_102", "Đồng bộ dữ liệu thanh toán thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    BILLING_CALCULATION_ERROR("BIL_103", "Lỗi khi tính toán tổng tiền", HttpStatus.INTERNAL_SERVER_ERROR),

    // ================== SUCCESS ==================
    SUCCESS("SUC_200", "Thành công", HttpStatus.OK),
    CREATED("SUC_201", "Đã tạo mới thành công", HttpStatus.CREATED);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    BillingException(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
