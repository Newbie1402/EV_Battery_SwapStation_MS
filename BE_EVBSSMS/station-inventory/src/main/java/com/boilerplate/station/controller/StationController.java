package com.boilerplate.station.controller;

import com.boilerplate.station.model.DTO.StationDTO;
import com.boilerplate.station.model.createRequest.StationRequest;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;

    @GetMapping("/getAll")
    public ResponseEntity<ResponseData<List<StationDTO>>> getAllStations() {
        return stationService.getAllStations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseData<StationDTO>> getStationById(@PathVariable Long id) {
        return stationService.getStationById(id);
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseData<StationDTO>> createStation(@RequestBody StationRequest request) {
        return stationService.createStation(request);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ResponseData<StationDTO>> updateStation(
            @PathVariable Long id,
            @RequestBody StationRequest request) {
        return stationService.updateStation(id, request);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseData<Void>> deleteStation(@PathVariable Long id) {
        return stationService.deleteStation(id);
    }
}
