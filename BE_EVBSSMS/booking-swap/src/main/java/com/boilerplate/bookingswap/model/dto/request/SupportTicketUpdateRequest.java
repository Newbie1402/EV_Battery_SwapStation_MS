package com.boilerplate.bookingswap.model.dto.request;

import com.boilerplate.bookingswap.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO nhận dữ liệu yêu cầu cập nhật ticket hỗ trợ (dành cho admin/staff)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketUpdateRequest {

    /** Trạng thái ticket */
    private TicketStatus ticketStatus;

    /** Phản hồi từ nhân viên hoặc admin */
    private String response;
}

