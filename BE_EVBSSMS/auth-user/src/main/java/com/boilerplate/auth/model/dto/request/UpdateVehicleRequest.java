package com.boilerplate.auth.model.dto.request;

import com.boilerplate.auth.enums.VehicleStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * DTO cho yêu cầu cập nhật thông tin phương tiện
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateVehicleRequest {

    @Size(max = 50, message = "Model không được quá 50 ký tự")
    private String model;

    @Size(max = 15, message = "Biển số không được quá 15 ký tự")
    private String licensePlate;

    @Size(max = 50, message = "Loại pin không được quá 50 ký tự")
    private String batteryType;

    @Positive(message = "Dung lượng pin phải là số dương")
    private Double batteryCapacity;

    private VehicleStatus status;
}
