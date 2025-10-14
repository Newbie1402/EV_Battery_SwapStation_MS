package com.boilerplate.station.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "station_inventory")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
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
