package com.boilerplate.station.controller;

import com.boilerplate.station.model.DTO.BatteryReturnLogDTO;
import com.boilerplate.station.model.DTO.BatterySwapLogDTO;
import com.boilerplate.station.model.createRequest.BatteryReturnLogRequest;
import com.boilerplate.station.model.event.Producer.StationSwapSummaryDTO;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.service.BatteryService;
import com.boilerplate.station.service.StationService;
import com.boilerplate.station.service.StationSwapSummaryService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/swaplog")
@RequiredArgsConstructor
public class SwapLogController {

    @Autowired
    private BatteryService batteryService;

    @Autowired
    private StationSwapSummaryService stationSwapSummaryService;


    // ========================= GET BY STATION ID =========================
    @Operation(
            summary = "Lấy danh sách lịch sử đổi pin theo trạm",
            description = "API trả về toàn bộ lịch sử đổi pin giữa xe và trạm dựa trên stationId."
    )
    @GetMapping("/verhicle-station/station/{stationId}")
    public ResponseEntity<ResponseData<List<BatterySwapLogDTO>>> getBatterySwapLogsByStationId(
            @PathVariable Long stationId) {
        return batteryService.getSwapLogsByStationId(stationId);
    }

    // ========================= GET ALL =========================
    @Operation(
            summary = "Lấy toàn bộ lịch sử đổi pin",
            description = "API trả về danh sách tất cả các log đổi pin trong hệ thống."
    )
    @GetMapping("/verhicle-station/getall")
    public ResponseEntity<ResponseData<List<BatterySwapLogDTO>>> getAllSwapLogs() {
        return batteryService.getAllSwapLogs();
    }

    @PostMapping("/returnlog/{swaplogId}")
    public ResponseEntity<ResponseData<BatteryReturnLogDTO>> createLog(
            @PathVariable Long swaplogId,
            @RequestBody BatteryReturnLogRequest request) {
        return batteryService.createLog(request, swaplogId);
    }

    /**
     * Cập nhật log trả pin
     */
    @PutMapping("/{id}")
    public ResponseEntity<ResponseData<BatteryReturnLogDTO>> updateLog(@PathVariable Long id,
                                                                       @RequestBody BatteryReturnLogRequest request) {
        return batteryService.updateLog(id, request);
    }

    @GetMapping("/getallsumary")
    public ResponseEntity<ResponseData<List<StationSwapSummaryDTO>>> getAllSwapSummary() {
        // Lấy tất cả tổng hợp swap theo trạm, ngày và khung giờ
        List<StationSwapSummaryDTO> summaries = stationSwapSummaryService.getAllSwapSummary();

        return ResponseEntity.ok(
                ResponseData.<List<StationSwapSummaryDTO>>builder()
                        .statusCode(200)
                        .message("Lấy tất cả tổng hợp swap thành công")
                        .data(summaries)
                        .build()
        );
    }

}
