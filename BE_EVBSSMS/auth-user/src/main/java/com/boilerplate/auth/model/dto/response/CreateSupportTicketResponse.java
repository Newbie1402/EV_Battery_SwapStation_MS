package com.boilerplate.auth.model.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO khi tạo support ticket thành công
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSupportTicketResponse {

    @Schema(description = "Mã ticket vừa tạo", example = "TKT-1731571200000-abc12345")
    private String ticketId;

    @Schema(description = "Trạng thái", example = "SENT")
    private String status;

    @Schema(description = "Thông báo cho người dùng")
    private String message;
}

