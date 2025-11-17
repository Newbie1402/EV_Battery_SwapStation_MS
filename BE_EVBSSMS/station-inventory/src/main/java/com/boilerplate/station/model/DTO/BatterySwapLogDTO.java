package com.boilerplate.station.model.DTO;

import com.boilerplate.station.model.entity.BatterySwapLog;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatterySwapLogDTO {

    private Long id;
    private Long verhicleBatteryId;
    private Long stationBatteryId;
    private Long stationId;
    private Long vehicleId;
    private Long batteryReturnLogId;
    private LocalDateTime swapTime;

    // ===============================
    //       MAPPER STATIC
    // ===============================
    public static BatterySwapLogDTO fromEntity(BatterySwapLog log) {
        if (log == null) return null;

        return BatterySwapLogDTO.builder()
                .id(log.getId())
                .verhicleBatteryId(log.getVerhicleBattery() != null ? log.getVerhicleBattery().getId() : null)
                .stationBatteryId(log.getStationBattery() != null ? log.getStationBattery().getId() : null)
                .stationId(log.getStation() != null ? log.getStation().getId() : null)
                .vehicleId(log.getVehiceId() != null ? log.getVehiceId().getId() : null)
                .batteryReturnLogId(log.getBatteryReturnLog() != null ? log.getBatteryReturnLog().getId() : null)
                .swapTime(log.getSwapTime())
                .build();
    }
}
