package com.boilerplate.station.model.createRequest;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddBatteryRequest {
    private String stationCode;  // Mã trạm
    private String batteryCode;  // Mã pin muốn thêm
}
