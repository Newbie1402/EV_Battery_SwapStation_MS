package com.boilerplate.auth.model.dto.response;

import com.boilerplate.auth.enums.TicketStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Response DTO sau khi cập nhật trạng thái support ticket
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTicketStatusResponse {

    @Schema(description = "Mã ticket", example = "TKT-1731648000000-a1b2c3d4")
    private String ticketId;

    @Schema(description = "Trạng thái hiện tại", example = "IN_PROGRESS")
    private TicketStatus status;

    @Schema(description = "Thời gian cập nhật", example = "2025-11-15T10:00:00Z")
    private Instant updatedAt;

    @Schema(description = "Thông báo", example = "Cập nhật trạng thái thành công")
    private String message;
}

