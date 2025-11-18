package com.boilerplate.billing.testapi;

import com.boilerplate.billing.testapi.BatteryStatus;
import com.boilerplate.billing.testapi.OwnerType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatteryDTO {
    private Long id;
    private String batteryCode;
    private String model;
    private Double capacity; // Wh
    private Double soh;      // State of Health (%)
    private Double soc;      // State of Charge (%)
    private BatteryStatus status;

    private OwnerType ownerType;
    private String referenceId;
}
