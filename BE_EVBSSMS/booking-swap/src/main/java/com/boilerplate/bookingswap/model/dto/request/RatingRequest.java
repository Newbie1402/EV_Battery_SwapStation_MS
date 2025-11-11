package com.boilerplate.bookingswap.model.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO nhận dữ liệu yêu cầu đánh giá trạm
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingRequest {

    /** Id booking liên quan (nếu có) */
    private String bookingId;

    /** Id tài xế */
    @NotBlank(message = "driverId không được để trống")
    private String driverId;

    /** Id trạm */
    @NotBlank(message = "stationId không được để trống")
    private String stationId;

    /** Điểm đánh giá (1-5 sao) */
    @NotNull(message = "score không được để trống")
    @Min(value = 1, message = "Điểm đánh giá tối thiểu là 1")
    @Max(value = 5, message = "Điểm đánh giá tối đa là 5")
    private Integer score;

    /** Nội dung nhận xét */
    private String comment;
}