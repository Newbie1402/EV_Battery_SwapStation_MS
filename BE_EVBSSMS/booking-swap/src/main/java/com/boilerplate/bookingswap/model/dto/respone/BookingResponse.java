package com.boilerplate.bookingswap.model.dto.respone;

import com.boilerplate.bookingswap.enums.BookingStatus;
import com.boilerplate.bookingswap.enums.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO trả dữ liệu đặt lịch đổi pin về cho client
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    /** Id booking */
    private Long id;

    /** Id tài xế */
    private String driverId;

    /** Id trạm */
    private String stationId;

    /** Id model pin */
    private String batteryModelId;

    /** Thời gian đặt lịch */
    private LocalDateTime bookingTime;

    /** Thời gian được lên lịch */
    private LocalDateTime scheduledTime;

    /** Loại thanh toán */
    private PaymentType paymentType;

    /** Id giao dịch */
    private Long paymentId;

    /** Ghi chú */
    private String notes;

    /** Id gói thuê pin (nếu có) */
    private String packageId;

    /** Trạng thái booking */
    private BookingStatus bookingStatus;

    /** Thời gian tạo */
    private LocalDateTime createdAt;

    private boolean IsPaid;

    /** Thời gian cập nhật */
    private LocalDateTime updatedAt;
}

