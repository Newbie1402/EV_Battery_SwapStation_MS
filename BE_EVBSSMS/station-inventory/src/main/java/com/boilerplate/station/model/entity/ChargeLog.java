package com.boilerplate.station.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "charge_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChargeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Thông tin SoC ---
    @Column(nullable = false)
    private Double socBefore;  // phần trăm trước khi sạc (%)

    @Column(nullable = false)
    private Double socAfter;   // phần trăm sau khi sạc (%)

    // --- Số điện tiêu thụ (Wh) ---
    @Column(nullable = false)
    private Double energyConsumed; // số Wh tiêu thụ trong lần sạc

    // --- Thời gian sạc ---
    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    // --- Liên kết đến pin ---
    @ManyToOne
    @JoinColumn(name = "battery_id", nullable = false)
    private Battery battery;

    // --- Liên kết đến slot (khe sạc) ---
    @ManyToOne
    @JoinColumn(name = "slot_id", nullable = false)
    private BatterySlot slot;

    // --- Liên kết đến trạm sạc ---
    @ManyToOne
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    // --- Hàm tiện ích tính số điện tiêu thụ (tùy chọn) ---
    public static double calculateEnergyConsumed(double capacityWh, double soh, double socBefore, double socAfter) {
        // Sử dụng công thức: E = capacity * (soh/100) * ((socAfter - socBefore)/100)
        return capacityWh * (soh / 100.0) * ((socAfter - socBefore) / 100.0);
    }
}
