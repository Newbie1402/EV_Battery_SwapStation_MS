package com.boilerplate.billing.controller;

import com.boilerplate.billing.model.request.ReportRequest;
import com.boilerplate.billing.model.response.ResponseData;
import com.boilerplate.billing.model.entity.MonthlyReport;
import com.boilerplate.billing.model.entity.StationMonthlyReport;
import com.boilerplate.billing.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/monthly")
    public ResponseEntity<ResponseData<MonthlyReport>> getMonthlyReport(@RequestBody ReportRequest request) {
        return ResponseEntity.ok(reportService.generateMonthlyReport(request));
    }

    @PostMapping("/station")
    public ResponseEntity<ResponseData<List<StationMonthlyReport>>> getStationMonthlyReport(@RequestBody ReportRequest request) {
        return ResponseEntity.ok(reportService.generateStationMonthlyReport(request));
    }
}
