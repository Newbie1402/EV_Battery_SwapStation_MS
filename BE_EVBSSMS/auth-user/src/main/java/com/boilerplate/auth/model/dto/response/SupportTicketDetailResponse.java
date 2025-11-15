package com.boilerplate.auth.model.dto.response;

import com.boilerplate.auth.enums.SupportTicketType;
import com.boilerplate.auth.enums.TicketPriority;
import com.boilerplate.auth.enums.TicketStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Response DTO chi tiết support ticket
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicketDetailResponse {

    @Schema(description = "ID nội bộ", example = "1")
    private Long id;

    @Schema(description = "Mã ticket", example = "TKT-1731648000000-a1b2c3d4")
    private String ticketId;

    @Schema(description = "Thông tin người tạo ticket")
    private UserInfo user;

    @Schema(description = "Thông tin phương tiện (nếu có)")
    private VehicleInfo vehicle;

    @Schema(description = "Vị trí xảy ra sự cố", example = "Trạm đổi pin Láng Hạ, Hà Nội")
    private String location;

    @Schema(description = "Loại sự cố", example = "BATTERY_ISSUE")
    private SupportTicketType ticketType;

    @Schema(description = "Mức độ ưu tiên", example = "HIGH")
    private TicketPriority priority;

    @Schema(description = "Trạng thái", example = "IN_PROGRESS")
    private TicketStatus status;

    @Schema(description = "Tiêu đề", example = "Pin không sạc được")
    private String title;

    @Schema(description = "Mô tả chi tiết")
    private String description;

    @Schema(description = "Danh sách URL file đính kèm")
    private List<String> attachments;

    @Schema(description = "Thời gian xảy ra sự cố", example = "2025-11-15T09:00:00Z")
    private Instant incidentTime;

    @Schema(description = "Thời gian giải quyết xong", example = "2025-11-15T11:00:00Z")
    private Instant resolvedAt;

    @Schema(description = "Người giải quyết (employeeId)", example = "STAFF001")
    private String resolvedBy;

    @Schema(description = "Ghi chú giải quyết")
    private String resolutionNotes;

    @Schema(description = "Thời gian tạo", example = "2025-11-15T09:05:00Z")
    private Instant createdAt;

    @Schema(description = "Thời gian cập nhật cuối", example = "2025-11-15T11:15:00Z")
    private Instant updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        @Schema(description = "ID người dùng", example = "1")
        private Long id;

        @Schema(description = "Email", example = "driver@example.com")
        private String email;

        @Schema(description = "Họ tên", example = "Nguyễn Văn A")
        private String fullName;

        @Schema(description = "Mã nhân viên", example = "EVD120612")
        private String employeeId;

        @Schema(description = "Số điện thoại", example = "0123456789")
        private String phone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VehicleInfo {
        @Schema(description = "ID phương tiện", example = "1")
        private Long id;

        @Schema(description = "Mã xe", example = "EV31141125VF5")
        private String vehicleId;

        @Schema(description = "VIN", example = "VF12345678901234")
        private String vin;

        @Schema(description = "Biển số", example = "30A-12345")
        private String licensePlate;

        @Schema(description = "Model", example = "VF e34")
        private String model;
    }
}

