package com.boilerplate.station.model.createRequest;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatterySwapStationLogRequest {
    private String oldStationBatteryCode;    // ID pin cũ ở trạm ban đầu
    private String newStationBatteryCode;    // ID pin mới ở trạm mới
    private String oldStationCode;           // ID trạm cũ
    private String newStationCode;           // ID trạm mới
}
