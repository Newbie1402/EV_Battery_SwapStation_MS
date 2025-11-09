package com.boilerplate.billing.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "monthly_report")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int year;
    private int month;

    private double totalRevenue;
    private double packageRevenue;
    private double stationRevenue;

    private long totalTransactions;
    private long packageTransactions;
    private long stationTransactions;
    private double averageRevenue;

    private LocalDateTime updatedAt;
}
