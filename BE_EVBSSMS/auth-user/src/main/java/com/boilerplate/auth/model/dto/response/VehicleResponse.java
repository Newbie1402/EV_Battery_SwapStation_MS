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

    private Long id;
    private String vin;
    private String model;
    private String licensePlate;
    private String batteryType;
    private Double batteryCapacity;
    private VehicleStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
