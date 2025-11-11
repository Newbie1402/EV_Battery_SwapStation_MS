package com.boilerplate.bookingswap.model.dto.respone;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO trả về thống kê booking
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatisticsResponse {

    /** Ngày thống kê */
    private LocalDate date;

    /** Tổng số booking */
    private Long totalBookings;

    /** Số booking đang chờ */
    private Long pendingBookings;

    /** Số booking đã xác nhận */
    private Long confirmedBookings;

    /** Số booking hoàn thành */
    private Long completedBookings;

    /** Số booking đã hủy */
    private Long cancelledBookings;

    /** Tỷ lệ hoàn thành (%) */
    private Double completionRate;

    /** Tỷ lệ hủy (%) */
    private Double cancellationRate;
}

