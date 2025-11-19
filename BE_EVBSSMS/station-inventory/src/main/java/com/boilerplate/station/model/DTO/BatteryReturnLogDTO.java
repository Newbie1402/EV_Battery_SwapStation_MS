package com.boilerplate.station.model.DTO;

import com.boilerplate.station.enums.BatteryCondition;
import com.boilerplate.station.model.entity.BatteryReturnLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BatteryReturnLogDTO {
    private Long id;
    private String bookingId;
    private String customerId;
    private String stationId;
    private Long batteryId;
    private BatteryCondition condition;
    private String description;
    private String note;
    private LocalDateTime returnTime;

    public static BatteryReturnLogDTO fromEntity(BatteryReturnLog log) {
        return BatteryReturnLogDTO.builder()
                .id(log.getId())
                .bookingId(log.getBookingId())
                .customerId(log.getCustomerId())
                .stationId(log.getStationId())
                .batteryId(log.getBattery() != null ? log.getBattery().getId() : null)
                .condition(log.getCondition())
                .description(log.getDescription())
                .note(log.getNote())
                .returnTime(log.getReturnTime())
                .build();
    }
}
