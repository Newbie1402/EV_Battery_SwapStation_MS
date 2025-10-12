package com.EVBatterySwapStation.station.model.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "station_health_log")
public class StationHealthLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "station_id")
    private Station station;

    private Double avgSoH;
    private Double temperature;
    private Double humidity;
    private LocalDateTime recordedAt;
}

