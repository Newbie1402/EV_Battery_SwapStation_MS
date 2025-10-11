package com.boilerplate.auth.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO cho việc thêm phương tiện mới
 * Chỉ dành cho tài xế (DRIVER)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddVehicleRequest {

    /**
     * VIN - Số khung xe (17 ký tự)
     */
    @NotBlank(message = "VIN không được để trống")
    @Pattern(regexp = "^[A-HJ-NPR-Z0-9]{17}$", message = "VIN không hợp lệ (phải là 17 ký tự)")
    private String vin;

    /**
     * Model xe (ví dụ: VF e34, VF 8, VF 9)
     */
    @NotBlank(message = "Model xe không được để trống")
    private String model;

    /**
     * Biển số xe
     */
    @NotBlank(message = "Biển số xe không được để trống")
    @Pattern(regexp = "^[0-9]{2}[A-Z]{1,2}[0-9]{4,5}$", message = "Biển số xe không hợp lệ")
    private String licensePlate;

    /**
     * Loại pin
     */
    @NotBlank(message = "Loại pin không được để trống")
    private String batteryType;

    /**
     * Dung lượng pin (kWh) -
     */
    @Positive(message = "Dung lượng pin phải lớn hơn 0")
    private Double batteryCapacity;

    /**
     * Ghi chú
     */
    private String notes;
}
