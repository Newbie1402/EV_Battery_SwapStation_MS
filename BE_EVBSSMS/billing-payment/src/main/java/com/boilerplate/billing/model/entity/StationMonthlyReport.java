package com.boilerplate.billing.model.entity;

import com.boilerplate.billing.model.event.consumer.entity.Station;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationMonthlyReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String stationId;

    private int year;
    private int month;

    private double revenue;
    private long transactions;
    private double averageRevenue;

    private LocalDateTime updatedAt = LocalDateTime.now();
}
