package com.boilerplate.station.model.DTO;

import com.boilerplate.station.model.entity.ChargeLog;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChargeLogDTO {
    private Long id;
    private Double socBefore;
    private Double socAfter;
    private Double energyConsumed;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long batteryId;
    private String batteryCode;
    private Long slotId;
    private Long stationId;
    private String stationName;

    public static ChargeLogDTO fromEntity(ChargeLog e) {
        if (e == null) return null;

        ChargeLogDTO dto = new ChargeLogDTO();
        dto.id = e.getId();
        dto.socBefore = e.getSocBefore();
        dto.socAfter = e.getSocAfter();
        dto.energyConsumed = e.getEnergyConsumed();
        dto.startTime = e.getStartTime();
        dto.endTime = e.getEndTime();
        if (e.getBattery() != null) {
            dto.batteryId = e.getBattery().getId();
            dto.batteryCode = e.getBattery().getBatteryCode();
        }
        if (e.getSlot() != null) dto.slotId = e.getSlot().getId();
        if (e.getStation() != null) {
            dto.stationId = e.getStation().getId();
            dto.stationName = e.getStation().getStationName();
        }
        return dto;
    }
}
