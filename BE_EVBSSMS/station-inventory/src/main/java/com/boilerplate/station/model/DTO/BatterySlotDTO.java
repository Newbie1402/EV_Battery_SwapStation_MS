package com.boilerplate.station.model.DTO;

import com.boilerplate.station.enums.SlotStatus;
import com.boilerplate.station.model.entity.BatterySlot;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BatterySlotDTO {
    private Long id;
    private String slotCode;
    private boolean isAvailable;
    private SlotStatus status;
    private Long stationId;
    private String stationName;
    private Long batteryId;
    private String batteryCode;

    public static BatterySlotDTO fromEntity(BatterySlot slot) {
        if (slot == null) return null;

        return BatterySlotDTO.builder()
                .id(slot.getId())
                .slotCode(slot.getSlotCode())
                .isAvailable(slot.isAvailable())
                .status(slot.getStatus())
                .stationId(slot.getStation() != null ? slot.getStation().getId() : null)
                .stationName(slot.getStation() != null ? slot.getStation().getStationName() : null)
                .batteryId(slot.getBattery() != null ? slot.getBattery().getId() : null)
                .batteryCode(slot.getBattery() != null ? slot.getBattery().getBatteryCode() : null)
                .build();
    }
}
