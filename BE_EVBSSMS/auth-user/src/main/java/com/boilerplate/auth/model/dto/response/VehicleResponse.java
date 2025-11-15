package com.boilerplate.auth.model.dto.response;

import com.boilerplate.auth.enums.VehicleStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO chứa thông tin phương tiện
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VehicleResponse {

    private String vehicleId; // Mã xe công khai (EV45141124VFe34)
    private String vin;
    private String model;
    private String licensePlate;
    private String batteryType;
    private Double batteryCapacity;
    private VehicleStatus status;
    private String notes;
    private String imageUrl; // URL ảnh xe từ AWS S3

    // Thông tin chủ sở hữu (nếu có)
    private String employeeId; // Mã nhân viên của tài xế được cấp phát
    private String driverName; // Tên tài xế được cấp phát

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
