package com.boilerplate.station.model.entity;

import com.boilerplate.station.enums.BatteryStatus;
import com.boilerplate.station.enums.OwnerType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "batteries")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Battery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String batteryCode;
    private String model;
    private Double capacity; // Wh
    private Double soh;      // State of Health (%)
    private Double soc;      // State of Charge (%)

    @Enumerated(EnumType.STRING)
    private BatteryStatus status; // FULL, CHARGING, MAINTENANCE, DEFECTIVE, IN_USE


    private OwnerType ownerType; // "STATION" hoặc "VERHICE"
    private Long referenceId; // id của Station hoặc User tương ứng

}

