package com.boilerplate.bookingswap.model.dto.request;

import com.boilerplate.bookingswap.enums.BookingStatus;
import com.boilerplate.bookingswap.enums.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO nhận dữ liệu yêu cầu cập nhật đặt lịch đổi pin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingUpdateRequest {

    /** Thời gian được lên lịch */
    private LocalDateTime scheduledTime;

    /** Loại thanh toán */
    private PaymentType paymentType;

    /** Id thanh toán */
    private Long paymentId;

    /** Ghi chú */
    private String notes;

    /** Trạng thái booking */
    private BookingStatus bookingStatus;
}