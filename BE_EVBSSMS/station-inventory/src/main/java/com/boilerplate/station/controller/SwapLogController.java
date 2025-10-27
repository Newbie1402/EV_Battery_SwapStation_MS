package com.boilerplate.station.controller;

import com.boilerplate.station.model.DTO.BatterySwapLogDTO;
import com.boilerplate.station.model.entity.Battery;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.service.BatteryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/api/swaplog")
@RequiredArgsConstructor
public class SwapLogController {

    @Autowired
    private BatteryService batteryService;

    @GetMapping("/verhicle-station/station/{stationId}")
    public ResponseEntity<ResponseData<List<BatterySwapLogDTO>>> getBatterySwapLogsByStationId(@PathVariable Long stationId) {
        return batteryService.getSwapLogsByStationId(stationId);
    }

    @GetMapping("/verhicle-station/getall")
    public ResponseEntity<ResponseData<List<BatterySwapLogDTO>>> getAllSwapLogs() {
        return batteryService.getAllSwapLogs();
    }
}
