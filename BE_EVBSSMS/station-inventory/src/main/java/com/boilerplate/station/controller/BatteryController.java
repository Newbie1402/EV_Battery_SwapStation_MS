package com.boilerplate.station.controller;

import com.boilerplate.station.model.DTO.BatteryDTO;

import com.boilerplate.station.model.createRequest.BatteryRequest;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.service.BatteryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batteries")
@RequiredArgsConstructor
public class BatteryController {

    private final BatteryService batteryService;

    @GetMapping
    public ResponseEntity<ResponseData<List<BatteryDTO>>> getAllBatteries() {
        return batteryService.getAllBatteries();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseData<BatteryDTO>> getBatteryById(@PathVariable Long id) {
        return batteryService.getBatteryById(id);
    }

    @PostMapping
    public ResponseEntity<ResponseData<BatteryDTO>> createBattery(@RequestBody BatteryRequest request) {
        return batteryService.createBattery(request);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseData<BatteryDTO>> updateBattery(
            @PathVariable Long id,
            @RequestBody BatteryRequest request) {
        return batteryService.updateBattery(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseData<Void>> deleteBattery(@PathVariable Long id) {
        return batteryService.deleteBattery(id);
    }
}
