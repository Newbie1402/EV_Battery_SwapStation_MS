package com.boilerplate.station.model.DTO;

import com.boilerplate.station.model.entity.BatterySwapLog;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatterySwapLogDTO {

    private Long id;
    private BatteryDTO vehicleBattery;   // pin trên xe
    private BatteryDTO stationBattery;   // pin trong trạm
    private Long stationId;
    private Long vehicleId;
    private Long batteryReturnLogId;
    private LocalDateTime swapTime;

    public static BatterySwapLogDTO fromEntity(BatterySwapLog entity) {
        if (entity == null) return null;

        return new BatterySwapLogDTO(
                entity.getId(),
                BatteryDTO.fromEntity(entity.getVerhicleBattery()),
                BatteryDTO.fromEntity(entity.getStationBattery()),
                entity.getStationId(),
                entity.getVerhiceId(),
                entity.getBatteryReturnLog() != null ? entity.getBatteryReturnLog().getId() : null,
                entity.getSwapTime()
        );
    }
}
