package com.boilerplate.station.model.entity;

import com.boilerplate.station.enums.BatteryCondition;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "battery_return_logs")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BatteryReturnLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bookingId; // từ Booking service
    private String customerId;
    private String stationId;

    @ManyToOne
    @JoinColumn(name = "battery_id")
    private Battery battery;

    @Enumerated(EnumType.STRING)
    private BatteryCondition condition; // GOOD, MINOR_DAMAGE, SERIOUS_DAMAGE, LOST

    private String Description;
    private String note;
    private LocalDateTime returnTime;
}

