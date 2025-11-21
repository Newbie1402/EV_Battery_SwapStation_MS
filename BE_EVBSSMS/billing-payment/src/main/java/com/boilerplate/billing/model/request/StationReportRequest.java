package com.boilerplate.billing.model.request;

import com.boilerplate.billing.model.entity.StationMonthlyReport;
import lombok.Data;

import java.util.List;

@Data
public class StationReportRequest {
    private List<Object> report;
}
