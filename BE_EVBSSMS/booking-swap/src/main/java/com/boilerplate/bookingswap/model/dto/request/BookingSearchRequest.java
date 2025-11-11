package com.boilerplate.bookingswap.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO nhận dữ liệu yêu cầu tìm kiếm/lọc booking
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSearchRequest {

    /** Id tài xế */
    private String driverId;

    /** Id trạm */
    private String stationId;

    /** Thời gian bắt đầu tìm kiếm */
    private LocalDateTime startDate;

    /** Thời gian kết thúc tìm kiếm */
    private LocalDateTime endDate;

    /** Trạng thái booking */
    private String bookingStatus;

    /** Số trang (mặc định là 0) */
    private Integer page = 0;

    /** Số lượng mỗi trang (mặc định là 10) */
    private Integer size = 10;
}