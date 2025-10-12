package com.EVBatterySwapStation.station.model.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "station_inventory")
public class StationInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long stationId;
    private int fullCount;
    private int chargingCount;
    private int maintenanceCount;
    private int defectiveCount;

    private LocalDateTime updatedAt;
}
