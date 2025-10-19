package com.boilerplate.station.model.createRequest;

import com.boilerplate.station.enums.SlotStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatterySlotRequest {
    private String slotCode;
    private boolean isAvailable;
    private SlotStatus status;
    private Long stationId;
    private Long batteryId;
}
