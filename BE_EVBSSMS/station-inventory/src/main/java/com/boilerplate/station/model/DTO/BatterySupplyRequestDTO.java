package com.boilerplate.station.model.DTO;

import com.boilerplate.station.enums.SupplyRequestStatus;
import com.boilerplate.station.model.entity.BatterySupplyRequest;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BatterySupplyRequestDTO {
    private Long id;
    private String stationCode;
    private String stationName;
    private int requestedQuantity;
    private String batteryModel;
    private String reason;
    private SupplyRequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
    private String adminNote;

    public static BatterySupplyRequestDTO fromEntity(BatterySupplyRequest entity) {
        if (entity == null) return null;

        return BatterySupplyRequestDTO.builder()
                .id(entity.getId())
                .stationCode(entity.getStation() != null ? entity.getStation().getStationCode() : null)
                .stationName(entity.getStation() != null ? entity.getStation().getStationName() : null)
                .requestedQuantity(entity.getRequestedQuantity())
                .batteryModel(entity.getBatteryModel())
                .reason(entity.getReason())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .processedAt(entity.getProcessedAt())
                .adminNote(entity.getAdminNote())
                .build();
    }

}
