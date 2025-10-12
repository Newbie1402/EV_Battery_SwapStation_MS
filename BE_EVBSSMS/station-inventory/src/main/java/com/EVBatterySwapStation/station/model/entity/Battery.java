package com.EVBatterySwapStation.station.model.entity;

import com.EVBatterySwapStation.station.enums.BatteryStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "batteries")
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

    @ManyToOne
    @JoinColumn(name = "station_id")
    private Station station;

    @OneToOne(mappedBy = "battery", cascade = CascadeType.ALL)
    private BatterySlot slot;
}

