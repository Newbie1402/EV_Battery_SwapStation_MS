package com.boilerplate.bookingswap.model.dto.respone;

import com.boilerplate.bookingswap.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO trả dữ liệu ticket hỗ trợ về cho client
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketResponse {

    /** Id ticket */
    private Long id;

    /** Id người gửi yêu cầu (tài xế) */
    private String driverId;

    /** Id booking liên quan (nếu có) */
    private String bookingId;

    /** Tiêu đề yêu cầu */
    private String title;

    /** Mô tả chi tiết yêu cầu hỗ trợ */
    private String description;

    /** Trạng thái xử lý */
    private TicketStatus ticketStatus;

    /** Phản hồi từ nhân viên hoặc admin */
    private String response;

    /** Thời gian tạo */
    private LocalDateTime createdAt;

    /** Thời gian cập nhật */
    private LocalDateTime updatedAt;
}


