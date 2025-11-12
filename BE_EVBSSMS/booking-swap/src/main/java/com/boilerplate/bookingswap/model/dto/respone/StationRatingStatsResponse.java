package com.boilerplate.bookingswap.model.dto.respone;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO trả về thống kê đánh giá của trạm
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StationRatingStatsResponse {

    /** Id trạm */
    private String stationId;

    /** Tổng số đánh giá */
    private Long totalRatings;

    /** Điểm trung bình */
    private Double averageScore;

    /** Số đánh giá 5 sao */
    private Long fiveStarCount;

    /** Số đánh giá 4 sao */
    private Long fourStarCount;

    /** Số đánh giá 3 sao */
    private Long threeStarCount;

    /** Số đánh giá 2 sao */
    private Long twoStarCount;

    /** Số đánh giá 1 sao */
    private Long oneStarCount;
}

