package com.EVBatterySwapStation.station.model.entity;

import com.EVBatterySwapStation.station.enums.SlotStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "battery_slots")
public class BatterySlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String slotCode;
    private boolean isAvailable;

    @Enumerated(EnumType.STRING)
    private SlotStatus status; // EMPTY, OCCUPIED, CHARGING, OUT_OF_SERVICE

    @ManyToOne
    @JoinColumn(name = "station_id")
    private Station station;

    @OneToOne
    @JoinColumn(name = "battery_id")
    private Battery battery;
}

