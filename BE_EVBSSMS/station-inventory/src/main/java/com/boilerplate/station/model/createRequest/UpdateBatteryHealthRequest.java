package com.boilerplate.station.model.createRequest;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request chỉ dùng để cập nhật trạng thái sức khỏe (soh) và mức sạc (soc) của pin.
 * Cả hai trường đều là tùy chọn; ít nhất một trong hai phải được cung cấp khi gọi API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBatteryHealthRequest {

    // State of Health (%): 0..100
    @Min(0)
    @Max(100)
    private Double soh;

    // State of Charge (%): 0..100
    @Min(0)
    @Max(100)
    private Double soc;
}

