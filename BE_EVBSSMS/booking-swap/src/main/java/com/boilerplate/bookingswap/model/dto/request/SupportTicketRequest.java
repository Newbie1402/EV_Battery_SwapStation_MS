package com.boilerplate.bookingswap.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO nhận dữ liệu yêu cầu hỗ trợ/gửi ticket
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketRequest {

    /** Id người gửi yêu cầu (tài xế) */
    @NotBlank(message = "driverId không được để trống")
    private String driverId;

    /** Id booking liên quan (nếu có) */
    private String bookingId;

    /** Tiêu đề yêu cầu */
    @NotBlank(message = "title không được để trống")
    private String title;

    /** Mô tả chi tiết yêu cầu hỗ trợ */
    @NotBlank(message = "description không được để trống")
    private String description;
}

