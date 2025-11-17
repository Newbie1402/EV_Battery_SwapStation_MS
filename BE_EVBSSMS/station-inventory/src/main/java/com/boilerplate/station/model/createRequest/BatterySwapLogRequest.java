package com.boilerplate.station.model.createRequest;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatterySwapLogRequest {
    private String verhicleBatteryCode;      // ID pin của xe
    private String stationBatteryCode;       // ID pin trong trạm
    private String stationCode;              // ID trạm
    private String verhicleCode;             // ID xe
}
