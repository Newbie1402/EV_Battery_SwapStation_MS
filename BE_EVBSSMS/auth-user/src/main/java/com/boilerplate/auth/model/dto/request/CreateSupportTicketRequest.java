package com.boilerplate.auth.model.dto.request;

import com.boilerplate.auth.enums.SupportTicketType;
import com.boilerplate.auth.enums.TicketPriority;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Request DTO để tạo support ticket
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSupportTicketRequest {

    @Schema(description = "Mã xe gặp sự cố", example = "EV45141124VFe34")
    private String vehicleId;

    @Schema(description = "Vị trí xảy ra sự cố (user tự nhập)",
            example = "Trạm đổi pin Láng Hạ, Hà Nội")
    private String location;

    @NotNull(message = "Loại ticket không được trống")
    @Schema(description = "Loại sự cố", example = "BATTERY_ISSUE")
    private SupportTicketType ticketType;

    @Schema(description = "Mức độ ưu tiên (mặc định: MEDIUM)", example = "HIGH")
    @Builder.Default
    private TicketPriority priority = TicketPriority.MEDIUM;

    @NotBlank(message = "Tiêu đề không được trống")
    @Schema(description = "Tiêu đề ngắn gọn", example = "Pin không sạc")
    private String title;

    @NotBlank(message = "Mô tả không được trống")
    @Schema(description = "Mô tả chi tiết sự cố")
    private String description;

    @Schema(description = "Thời gian xảy ra sự cố (ISO 8601 UTC)", example = "2025-11-14T10:00:00Z")
    private Instant incidentTime;

    @Schema(description = "Danh sách URL file đính kèm")
    private List<String> attachments;
}

