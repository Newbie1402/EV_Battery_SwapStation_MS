package com.boilerplate.station.model.createRequest;


import lombok.Data;

@Data
public class BatterySlotRequest {
    private Long stationId;
    private String slotCode;
    private Long batteryId; // id pin cần gán vào slot

}
