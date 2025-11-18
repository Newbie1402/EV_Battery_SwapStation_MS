package com.boilerplate.station.controller;

import com.boilerplate.station.model.DTO.NearestStationDTO;
import com.boilerplate.station.model.DTO.StationDTO;
import com.boilerplate.station.model.createRequest.NearestStationRequest;
import com.boilerplate.station.model.createRequest.StationRequest;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.service.OpenStreetMapService;
import com.boilerplate.station.service.StationService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;

    @Autowired
    private OpenStreetMapService openStreetMapService;

    // ========================= GET ALL =========================
    @Operation(
            summary = "Lấy danh sách trạm",
            description = "API lấy toàn bộ danh sách các trạm đổi pin trong hệ thống."
    )
    @GetMapping("/getAll")
    public ResponseEntity<ResponseData<List<StationDTO>>> getAllStations() {
        return stationService.getAllStations();
    }

    // ========================= GET BY ID =========================
    @Operation(
            summary = "Lấy chi tiết trạm theo ID",
            description = "API lấy thông tin chi tiết của một trạm dựa trên ID."
    )
    @GetMapping("/{id}")
    public ResponseEntity<ResponseData<StationDTO>> getStationById(@PathVariable Long id) {
        return stationService.getStationById(id);
    }

    // ========================= CREATE =========================
    @Operation(
            summary = "Tạo mới trạm",
            description = "API tạo mới một trạm đổi pin dựa trên thông tin từ StationRequest."
    )
    @PostMapping("/create")
    public ResponseEntity<ResponseData<StationDTO>> createStation(@RequestBody StationRequest request) {
        return stationService.createStation(request);
    }

    // ========================= UPDATE =========================
    @Operation(
            summary = "Cập nhật thông tin trạm",
            description = "API cập nhật thông tin của trạm theo ID."
    )
    @PutMapping("/update/{id}")
    public ResponseEntity<ResponseData<StationDTO>> updateStation(
            @PathVariable Long id,
            @RequestBody StationRequest request) {
        return stationService.updateStation(id, request);
    }

    // ========================= DELETE =========================
    @Operation(
            summary = "Xóa trạm",
            description = "API xóa một trạm khỏi hệ thống dựa trên ID."
    )
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseData<Void>> deleteStation(@PathVariable Long id) {
        return stationService.deleteStation(id);
    }

    // ========================= NEAREST STATIONS =========================
    @Operation(
            summary = "Tìm trạm gần nhất",
            description = "API sử dụng OpenStreetMap để tìm danh sách các trạm gần vị trí người dùng (latitude, longitude)."
    )
    @PostMapping("/nearest")
    public ResponseEntity<ResponseData<List<NearestStationDTO>>> getNearestStations(
            @RequestBody NearestStationRequest request) {
        return openStreetMapService.findNearestStations(request.getLatitude(), request.getLongitude());
    }
}
