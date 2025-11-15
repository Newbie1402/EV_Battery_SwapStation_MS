package com.boilerplate.auth.model.dto.request;

import com.boilerplate.auth.enums.VehicleStatus;
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

    @Size(max = 20, message = "Mã nhân viên không được quá 20 ký tự")
    private String employeeId; // Mã nhân viên để cấp phát phương tiện (ví dụ: EVD120612)

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
