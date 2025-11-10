package com.boilerplate.station.controller;

import com.boilerplate.station.model.DTO.BatterySlotDTO;
import com.boilerplate.station.model.DTO.ChargeLogDTO;
import com.boilerplate.station.model.createRequest.BatterySlotRequest;
import com.boilerplate.station.model.entity.ChargeLog;
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

    // ========================= GET ALL =========================
    @GetMapping("/getall")
    public ResponseEntity<ResponseData<List<BatterySlotDTO>>> getAllSlots() {
        return batterySlotService.getAllSlots();
    }

    // ========================= GET BY ID =========================
    @GetMapping("get/{id}")
    public ResponseEntity<ResponseData<BatterySlotDTO>> getSlotById(@PathVariable Long id) {
        return batterySlotService.getSlotById(id);
    }

    // ========================= CREATE =========================
    @PostMapping("create")
    public ResponseEntity<ResponseData<BatterySlotDTO>> createSlot(@RequestBody BatterySlotRequest request) {
        return batterySlotService.createSlot(request);
    }

    // ========================= UPDATE =========================
    @PutMapping("update/{id}")
    public ResponseEntity<ResponseData<BatterySlotDTO>> updateSlot(
            @PathVariable Long id,
            @RequestBody BatterySlotRequest request) {
        return batterySlotService.updateSlot(id, request);
    }

    // ========================= DELETE =========================
    @DeleteMapping("delete/{id}")
    public ResponseEntity<ResponseData<Void>> deleteSlot(@PathVariable Long id) {
        return batterySlotService.deleteSlot(id);
    }

    // ========================= ASSIGN BATTERY TO SLOT =========================
    @PutMapping("/{slotId}/assign/{batteryId}")
    public ResponseEntity<ResponseData<BatterySlotDTO>> assignBatteryToSlot(
            @PathVariable Long slotId,
            @PathVariable Long batteryId) {
        return batterySlotService.assignBatteryToSlot(slotId, batteryId);
    }

    // ========================= SET SLOT EMPTY =========================
    @PutMapping("/full/set-empty/{slotId}")
    public ResponseEntity<ResponseData<BatterySlotDTO>> setSlotEmpty(@PathVariable Long slotId) {
        return batterySlotService.setSlotEmpty(slotId);
    }

    @GetMapping("/charge-logs/getall")
    public ResponseEntity<ResponseData<List<ChargeLogDTO>>> getAllChargeLogs() {
        return batterySlotService.getAllChargeLogs();
    }
}
