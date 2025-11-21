package com.boilerplate.billing.model.request;

import lombok.*;

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
    private double averageRevenue;
}
