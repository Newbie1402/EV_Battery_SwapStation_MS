package com.boilerplate.billing.controller;

import com.boilerplate.billing.model.DTO.StationMonthlyReportDTO;
import com.boilerplate.billing.model.response.ResponseData;
import com.boilerplate.billing.service.GeminiAnalysisService;
import com.boilerplate.billing.service.StationMonthlyReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final StationMonthlyReportService stationMonthlyReportService;
    private final GeminiAnalysisService geminiAnalysisService;

    /**
     * Test tạo báo cáo tháng trước (manual trigger)
     */
    @PostMapping("/generate-last-month")
    public ResponseData<String> generateLastMonthReport() {
        stationMonthlyReportService.generateMonthlyReportForLastMonth();
        return ResponseData.<String>builder()
                .statusCode(200)
                .message("Station monthly report for last month generated successfully")
                .data("Success")
                .build();
    }

    /**
     * Phân tích tất cả báo cáo hiện có bằng AI Gemini
     */
    @GetMapping("/analyze-all")
    public ResponseEntity<String> analyzeAllReports() {
        String analysisResult = geminiAnalysisService.analyzeAllSwapReports();
        return ResponseEntity.ok(analysisResult);
    }

    /**
     * Lấy tất cả báo cáo hiện có dạng DTO rút gọn
     */
//    @GetMapping("/all")
//    public ResponseData<List<StationMonthlyReportDTO>> getAllReports() {
//        List<StationMonthlyReportDTO> reports = geminiAnalysisService.getAllReports();
//        return ResponseData.<List<StationMonthlyReportDTO>>builder()
//                .statusCode(200)
//                .message("All station monthly reports")
//                .data(reports)
//                .build();
//    }

}
