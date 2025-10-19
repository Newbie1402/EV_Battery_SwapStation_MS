package com.boilerplate.station.controller;

import com.boilerplate.station.model.DTO.BatterySlotDTO;
import com.boilerplate.station.model.createRequest.BatterySlotRequest;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.service.BatterySlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/battery-slots")
@RequiredArgsConstructor
public class BatterySlotController {

    private final BatterySlotService batterySlotService;

    @GetMapping
    public ResponseEntity<ResponseData<List<BatterySlotDTO>>> getAllSlots() {
        return batterySlotService.getAllSlots();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseData<BatterySlotDTO>> getSlotById(@PathVariable Long id) {
        return batterySlotService.getSlotById(id);
    }

    @PostMapping
    public ResponseEntity<ResponseData<BatterySlotDTO>> createSlot(@RequestBody BatterySlotRequest request) {
        return batterySlotService.createSlot(request);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseData<BatterySlotDTO>> updateSlot(@PathVariable Long id,
                                                                   @RequestBody BatterySlotRequest request) {
        return batterySlotService.updateSlot(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseData<Void>> deleteSlot(@PathVariable Long id) {
        return batterySlotService.deleteSlot(id);
    }
}
