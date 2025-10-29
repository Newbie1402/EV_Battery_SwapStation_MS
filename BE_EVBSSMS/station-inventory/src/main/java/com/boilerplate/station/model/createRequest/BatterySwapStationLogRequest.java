package com.boilerplate.station.model.createRequest;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatterySwapStationLogRequest {
    private Long oldStationBatteryId;    // ID pin cũ ở trạm ban đầu
    private Long newStationBatteryId;    // ID pin mới ở trạm mới
    private Long oldStationId;           // ID trạm cũ
    private Long newStationId;           // ID trạm mới
}
