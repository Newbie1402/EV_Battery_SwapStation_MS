package com.EVBatterySwapStation.station.model.entity;

import com.EVBatterySwapStation.station.enums.StationStatus;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "stations")
public class Station {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String stationCode;
    private String stationName;

    private Double latitude;
    private Double longitude;

    private String address;
    private String phoneNumber;

    private int totalSlots;
    private int availableSlots;

    @Enumerated(EnumType.STRING)
    private StationStatus status; // ACTIVE, MAINTENANCE, OFFLINE

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL)
    private List<BatterySlot> slots;

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL)
    private List<Battery> batteries;
}

