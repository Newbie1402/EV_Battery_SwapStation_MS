package com.boilerplate.billing.model.DTO;

import com.boilerplate.billing.model.entity.StationMonthlyReport;
import com.boilerplate.billing.model.event.consumer.entity.Station;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StationMonthlyReportDTO {

    private String stationId;
    private int year;
    private int month;
    private double revenue;
    private long transactions;
    private LocalDateTime updatedAt;

    public static StationMonthlyReportDTO fromEntity(StationMonthlyReport entity) {
        return StationMonthlyReportDTO.builder()
                .stationId(entity.getStationId())
                .year(entity.getYear())
                .month(entity.getMonth())
                .revenue(entity.getRevenue())
                .transactions(entity.getTransactions())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
