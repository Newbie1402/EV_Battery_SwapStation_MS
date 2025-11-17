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
    private String verhicleBatteryCode;
    private String stationBatteryCode;
    private String stationCode;
    private String vehicleCode;
    private String batteryReturnLogId;
    private LocalDateTime swapTime;

    // ===============================
    //       MAPPER STATIC
    // ===============================
    public static BatterySwapLogDTO fromEntity(BatterySwapLog log) {
        if (log == null) return null;

        return BatterySwapLogDTO.builder()
                .id(log.getId())
                .verhicleBatteryCode(log.getVerhicleBattery() != null ? log.getVerhicleBattery().getBatteryCode() : null)
                .stationBatteryCode(log.getStationBattery() != null ? log.getStationBattery().getBatteryCode() : null)
                .stationCode(log.getStation() != null ? log.getStation().getStationCode() : null)
                .vehicleCode(log.getVehiceId())
                .batteryReturnLogId(log.getBatteryReturnLog() != null ? log.getBatteryReturnLog().getId().toString() : null)
                .swapTime(log.getSwapTime())
                .build();
    }

}
