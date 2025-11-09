package com.boilerplate.billing.model.dto;

import com.boilerplate.billing.model.entity.MonthlyReport;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MonthlyReportDTO {

    private int year;
    private int month;
    private double totalRevenue;
    private double packageRevenue;
    private double stationRevenue;
    private long totalTransactions;
    private long packageTransactions;
    private long stationTransactions;
    private LocalDateTime updatedAt;

    // ================== FROM ENTITY ==================
    public static MonthlyReportDTO fromEntity(MonthlyReport entity) {
        return MonthlyReportDTO.builder()
                .year(entity.getYear())
                .month(entity.getMonth())
                .totalRevenue(entity.getTotalRevenue())
                .packageRevenue(entity.getPackageRevenue())
                .stationRevenue(entity.getStationRevenue())
                .totalTransactions(entity.getTotalTransactions())
                .packageTransactions(entity.getPackageTransactions())
                .stationTransactions(entity.getStationTransactions())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
