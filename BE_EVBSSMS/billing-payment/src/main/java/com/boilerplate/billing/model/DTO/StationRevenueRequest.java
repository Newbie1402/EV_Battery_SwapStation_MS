package com.boilerplate.billing.model.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StationRevenueRequest {
    private List<StationRevenue> data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StationRevenue {
        private String stationId;
        private int year;
        private int month;
        private double revenue;
        private long transactions;
        private double averageRevenue;
    }

    private String question; // câu hỏi AI, ví dụ: "Dự báo nhu cầu sử dụng trạm này"
}
