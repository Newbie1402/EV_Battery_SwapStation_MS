package com.boilerplate.bookingswap.model.dto.respone;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO trả dữ liệu đánh giá trạm về cho client
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingResponse {

    /** Id đánh giá */
    private Long id;

    /** Id booking liên quan */
    private String bookingId;

    /** Id tài xế */
    private String driverId;

    /** Id trạm */
    private String stationId;

    /** Điểm đánh giá (1-5 sao) */
    private Integer score;

    /** Nội dung nhận xét */
    private String comment;

    /** Thời gian đánh giá */
    private LocalDateTime createdAt;
}

