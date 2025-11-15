package com.boilerplate.auth.model.event;

import com.boilerplate.auth.enums.SupportTicketType;
import com.boilerplate.auth.enums.TicketPriority;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.Map;

/**
 * Event model cho Support Ticket
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class SupportTicketEvent implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;
    /**
     * ID duy nhất của event (UUID)
     */
    @NotBlank(message = "Event ID không được để trống")
    @JsonProperty("id")
    private String eventId;

    /**
     * Nguồn phát sinh event (ví dụ: auth-service)
     */
    @NotBlank(message = "Event source không được để trống")
    @JsonProperty("source")
    private String source;

    /**
     * Phiên bản spec CloudEvents
     */
    @JsonProperty("specversion")
    @Builder.Default
    private String specVersion = "1.0";

    /**
     * Loại event
     */
    @NotBlank(message = "Event type không được để trống")
    @JsonProperty("type")
    private String type;

    /**
     * Timestamp khi event được tạo (ISO 8601)
     */
    @NotNull(message = "Event time không được để trống")
    @JsonProperty("time")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant eventTime;

    /**
     * ID để trace qua các service (correlation ID)
     */
    @JsonProperty("correlationid")
    private String correlationId;

    /**
     * Content type của data
     */
    @JsonProperty("datacontenttype")
    @Builder.Default
    private String dataContentType = "application/json";

    /**
     * Dữ liệu nghiệp vụ của support ticket
     */
    @NotNull(message = "Event data không được để trống")
    @JsonProperty("data")
    private SupportTicketData data;

    /**
     * Metadata bổ sung (optional)
     */
    @JsonProperty("metadata")
    private Map<String, Object> metadata;

    /**
     * Inner class chứa dữ liệu nghiệp vụ
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SupportTicketData implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        /**
         * Mã ticket
         */
        @NotBlank(message = "Ticket ID không được để trống")
        private String ticketId;

        /**
         * Mã nhân viên của người tạo ticket
         */
        @NotBlank(message = "Employee ID không được để trống")
        private String employeeId;

        /**
         * Mã xe công khai (vehicleId)
         */
        private String vehicleId;

        /**
         * VIN (Vehicle Identification Number)
         */
        private String vin;

        /**
         * Biển số xe
         */
        private String licensePlate;

        /**
         * Model xe
         */
        private String model;

        /**
         * Vị trí xảy ra sự cố (user nhập text tự do)
         */
        private String location;

        /**
         * Loại ticket
         */
        @NotNull(message = "Loại ticket không được để trống")
        private SupportTicketType ticketType;

        /**
         * Mức độ ưu tiên
         */
        @NotNull(message = "Mức độ ưu tiên không được để trống")
        @Builder.Default
        private TicketPriority priority = TicketPriority.MEDIUM;

        /**
         * Tiêu đề ticket
         */
        @NotBlank(message = "Tiêu đề không được để trống")
        private String title;

        /**
         * Mô tả chi tiết sự cố
         */
        @NotBlank(message = "Mô tả không được để trống")
        private String description;

        /**
         * Danh sách file đính kèm (URLs hoặc file paths)
         */
        private java.util.List<String> attachments;

        /**
         * Thời gian xảy ra sự cố
         */
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
        private Instant incidentTime;

        /**
         * Thời gian tạo ticket
         */
        @NotNull(message = "Thời gian tạo không được để trống")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
        private Instant createdAt;
    }
}
