package com.boilerplate.station.model.entity;

import com.boilerplate.station.enums.BatteryStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "battery_swap_logs")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BatterySwapStationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "old_battery_id")
    private Battery Battery;

    private String oldStationId;

    private String newStationId;

    private LocalDateTime swapTime;

}
