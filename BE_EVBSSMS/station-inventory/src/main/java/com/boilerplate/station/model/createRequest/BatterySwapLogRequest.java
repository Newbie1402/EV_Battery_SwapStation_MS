package com.boilerplate.station.model.createRequest;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatterySwapLogRequest {
    private Long verhicleBatteryId;      // ID pin của xe
    private Long stationBatteryId;       // ID pin trong trạm
    private Long stationId;              // ID trạm
    private Long verhicleId;             // ID xe
}
