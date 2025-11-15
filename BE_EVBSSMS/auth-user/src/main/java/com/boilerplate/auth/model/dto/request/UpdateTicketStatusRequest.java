package com.boilerplate.auth.model.dto.request;

import com.boilerplate.auth.enums.TicketStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để cập nhật trạng thái support ticket
 * Người xử lý (resolvedBy) sẽ tự động lấy từ token của user gọi API
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTicketStatusRequest {

    @NotNull(message = "Trạng thái không được trống")
    @Schema(description = "Trạng thái mới", example = "IN_PROGRESS")
    private TicketStatus status;

    @Schema(description = "Ghi chú khi cập nhật trạng thái", example = "Đã liên hệ với khách hàng")
    private String notes;
}

