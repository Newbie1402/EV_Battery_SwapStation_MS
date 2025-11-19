package com.boilerplate.station.model.createRequest;

import com.boilerplate.station.enums.BatteryCondition;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatteryReturnLogRequest {
    private String bookingId;
    private String customerId;
    private String stationId;
    private Long batteryId;
    private BatteryCondition condition;
    private String description;
    private String note;
    private LocalDateTime returnTime;
}
