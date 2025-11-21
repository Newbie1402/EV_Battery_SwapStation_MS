//package com.boilerplate.billing.controller;
//
//import com.boilerplate.billing.model.request.StationReportRequest;
//import com.boilerplate.billing.service.GeminiAnalysisService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/analysis")
//@RequiredArgsConstructor
//public class StationReportAnalysisController {
//
//    private final GeminiAnalysisService geminiAnalysisService;
//
//    @PostMapping("/station-report")
//    public ResponseEntity<?> analyze(@RequestBody StationReportRequest request) {
//        String result = geminiAnalysisService.analyzeReport(request);
//        return ResponseEntity.ok(result);
//    }
//}
