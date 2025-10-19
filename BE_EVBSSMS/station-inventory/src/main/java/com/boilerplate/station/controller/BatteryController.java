package com.boilerplate.station.controller;

import com.boilerplate.station.model.DTO.BatteryDTO;

import com.boilerplate.station.model.createRequest.BatteryRequest;
import com.boilerplate.station.model.event.Consumer.BatteryHoldEvent;
import com.boilerplate.station.model.event.Consumer.BatterySwapEvent;
import com.boilerplate.station.model.event.Consumer.BatterySwapStation;
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

    @GetMapping("/getall")
    public ResponseEntity<ResponseData<List<BatteryDTO>>> getAllBatteries() {
        return batteryService.getAllBatteries();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseData<BatteryDTO>> getBatteryById(@PathVariable Long id) {
        return batteryService.getBatteryById(id);
    }

    @PostMapping("/create")
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

    @PostMapping("/event/swapverhice-to-station")
    public ResponseEntity<ResponseData<Void>> handleBatterySwapEvent(@RequestBody BatterySwapEvent event) {
        return batteryService.handleBatterySwap(event);
    }

    @PostMapping("/event/swapstation-to-station")
    public ResponseEntity<ResponseData<Void>> handleBatterySwapStationEvent(@RequestBody BatterySwapStation event) {
        return batteryService.handleBatterySwapStation(event);
    }

    @PostMapping("/event/hold")
    public ResponseEntity<ResponseData<Void>> handleBatteryHoldEvent(@RequestBody BatteryHoldEvent event) {
        return batteryService.holdBattery(event);
    }

}
