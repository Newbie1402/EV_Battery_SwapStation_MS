package com.boilerplate.station.model.event.Producer;

import com.boilerplate.station.enums.TimeSlot;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "battery_swap_summary")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BatterySwapSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long stationId;      // ID trạm

    private LocalDate date;      // Ngày swap

    private TimeSlot timeSlot;     // Khung giờ: "0-6", "6-12", "12-18", "18-24"

    private int swapCount;       // Số lần swap trong khung giờ
}
