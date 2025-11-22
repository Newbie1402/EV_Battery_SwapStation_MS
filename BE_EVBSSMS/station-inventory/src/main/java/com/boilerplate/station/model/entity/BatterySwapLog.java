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
public class BatterySwapLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "verhice_battery_id")
    private Battery verhicleBattery;

    @ManyToOne
    @JoinColumn(name = "battery_id")
    private Battery stationBattery;

    @ManyToOne
    @JoinColumn(name = "statiom_id")
    private Station station;

    private String vehiceId;

    @OneToOne
    @JoinColumn(name = "battery_Return_Log_id")
    private BatteryReturnLog batteryReturnLog;

    private LocalDateTime swapTime;

}
