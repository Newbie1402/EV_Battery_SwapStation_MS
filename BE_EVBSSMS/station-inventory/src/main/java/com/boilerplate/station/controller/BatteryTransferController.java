package com.boilerplate.station.controller;

import com.boilerplate.station.enums.SupplyRequestStatus;
import com.boilerplate.station.model.DTO.BatterySupplyRequestDTO;
import com.boilerplate.station.model.createRequest.BatteryTransferRequest;
import com.boilerplate.station.model.createRequest.CreateSupplyRequest;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.model.entity.Battery;

import com.boilerplate.station.service.SupplyRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/battery-transfer")
@RequiredArgsConstructor
public class BatteryTransferController {

    private final SupplyRequestService supplyRequestService;

    /**
     * API chuyển nhiều pin sang trạm khác
     * POST /api/battery-transfer
     *
     * Body:
     * {
     *   "batteryCodes": ["BAT001", "BAT002"],
     *   "destinationStationCode": "ST002"
     * }
     */
    @PostMapping("/transfer")
    public ResponseEntity<ResponseData<Void>> transferBatteries(
            @RequestBody BatteryTransferRequest request) {

        return supplyRequestService.transferBatteries(
                request.getBatteryCodes(),
                request.getDestinationStationCode()
        );
    }

    @PostMapping("/request")
    public ResponseEntity<ResponseData<BatterySupplyRequestDTO>> createRequest(
            @RequestBody CreateSupplyRequest request) {
        return supplyRequestService.createRequest(request);
    }

    @PutMapping("/request/status/{id}")
    public ResponseEntity<ResponseData<BatterySupplyRequestDTO>> updateStatus(
            @PathVariable("id") Long requestId,
            @RequestParam("newStatus") SupplyRequestStatus newStatus,
            @RequestParam(value = "adminNote", required = false) String adminNote) {
        return supplyRequestService.updateStatus(requestId, newStatus, adminNote);
    }

    @GetMapping("/request/station/{stationCode}")
    public ResponseEntity<ResponseData<List<BatterySupplyRequestDTO>>> getByStationCode(
            @PathVariable("stationCode") String stationCode) {
        return supplyRequestService.getByStationCode(stationCode);
    }

    @GetMapping("/request/all")
    public ResponseEntity<ResponseData<List<BatterySupplyRequestDTO>>> getAllRequests() {
        return supplyRequestService.getAllRequests();
    }

    // Lấy chi tiết một yêu cầu theo ID (tùy chọn)
    @GetMapping("/request/{id}")
    public ResponseEntity<ResponseData<BatterySupplyRequestDTO>> getRequestById(
            @PathVariable("id") Long requestId) {
        return supplyRequestService.getRequestById(requestId);
    }
}
