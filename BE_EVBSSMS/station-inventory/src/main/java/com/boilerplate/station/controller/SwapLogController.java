package com.boilerplate.station.controller;

import com.boilerplate.station.model.DTO.BatterySwapLogDTO;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.service.BatteryService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/swaplog")
@RequiredArgsConstructor
public class SwapLogController {

    @Autowired
    private BatteryService batteryService;

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
}
