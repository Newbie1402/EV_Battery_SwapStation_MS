package com.boilerplate.station.model.DTO;

import com.boilerplate.station.model.entity.Vehicle;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleDTO {

    private Long id;
    private String vehicleId;
    private String vin;
    private String model;
    private String licensePlate;

    private String batteryType;
    private Double batteryCapacity;

    private String notes;
    private String imageUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ===============================
    //       MAPPER STATIC
    // ===============================
    public static VehicleDTO fromEntity(Vehicle vehicle) {
        if (vehicle == null) return null;

        return VehicleDTO.builder()
                .id(vehicle.getId())
                .vehicleId(vehicle.getVehicleId())
                .vin(vehicle.getVin())
                .model(vehicle.getModel())
                .licensePlate(vehicle.getLicensePlate())
                .batteryType(vehicle.getBatteryType())
                .batteryCapacity(vehicle.getBatteryCapacity())
                .notes(vehicle.getNotes())
                .imageUrl(vehicle.getImageUrl())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}
