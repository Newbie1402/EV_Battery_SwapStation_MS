package com.boilerplate.billing.model.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportRequest {
    private int year;
    private int month;
    private Long stationId; // optional, dùng cho StationMonthlyReport
}
