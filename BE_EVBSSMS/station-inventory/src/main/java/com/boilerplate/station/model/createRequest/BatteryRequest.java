package com.boilerplate.station.model.createRequest;

import com.boilerplate.station.enums.BatteryStatus;
import com.boilerplate.station.enums.OwnerType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BatteryRequest {
    private String model;
    private Double capacity; // Wh
    private Double soh;      // State of Health (%)
    private Double soc;      // State of Charge (%)
    private BatteryStatus status;

    private OwnerType ownerType; // STATION hoặc VEHICLE
    private Long referenceId; // ID của chủ sở hữu (trạm hoặc user)
}
