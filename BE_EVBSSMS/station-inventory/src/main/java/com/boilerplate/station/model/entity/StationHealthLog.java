package com.boilerplate.station.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "station_health_log")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StationHealthLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "station_id")
    private Station station;

    private Double avgSoH;

    private Double humidity;
    private LocalDateTime recordedAt;
}

