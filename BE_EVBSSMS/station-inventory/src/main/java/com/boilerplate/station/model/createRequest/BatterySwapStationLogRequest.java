package com.boilerplate.station.model.createRequest;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatterySwapStationLogRequest {
    private String oldStationBatteryId;    // ID pin cũ ở trạm ban đầu
    private String newStationBatteryId;    // ID pin mới ở trạm mới
    private String oldStationId;           // ID trạm cũ
    private String newStationId;           // ID trạm mới
}
