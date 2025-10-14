package com.boilerplate.station.service;

import com.boilerplate.station.model.DTO.StationDTO;
import com.boilerplate.station.model.createRequest.StationRequest;
import com.boilerplate.station.model.entity.Station;

import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StationService {

    private final StationRepository stationRepository;


    //========================= Station CRUD Operations ========================
    public ResponseEntity<ResponseData<List<StationDTO>>> getAllStations() {
        List<StationDTO> stations = stationRepository.findAll()
                .stream()
                .map(StationDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Fetched all stations successfully", stations)
        );
    }

    public ResponseEntity<ResponseData<StationDTO>> getStationById(Long id) {
        Optional<Station> station = stationRepository.findById(id);
        if (station.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Station not found", null));
        }

        StationDTO dto = StationDTO.fromEntity(station.get());
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Station found", dto)
        );
    }

    public ResponseEntity<ResponseData<StationDTO>> createStation(StationRequest request) {
        Station station = new Station();
        station.setStationCode(request.getStationCode());
        station.setStationName(request.getStationName());
        station.setLatitude(request.getLatitude());
        station.setLongitude(request.getLongitude());
        station.setAddress(request.getAddress());
        station.setPhoneNumber(request.getPhoneNumber());
        station.setTotalSlots(request.getTotalSlots());
        station.setAvailableSlots(request.getAvailableSlots());
        station.setStatus(request.getStatus());

        Station saved = stationRepository.save(station);
        StationDTO dto = StationDTO.fromEntity(saved);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseData<>(HttpStatus.CREATED.value(), "Station created successfully", dto));
    }

    public ResponseEntity<ResponseData<StationDTO>> updateStation(Long id, StationRequest request) {
        Optional<Station> existing = stationRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Station not found", null));
        }

        Station station = existing.get();
        station.setStationCode(request.getStationCode());
        station.setStationName(request.getStationName());
        station.setLatitude(request.getLatitude());
        station.setLongitude(request.getLongitude());
        station.setAddress(request.getAddress());
        station.setPhoneNumber(request.getPhoneNumber());
        station.setTotalSlots(request.getTotalSlots());
        station.setAvailableSlots(request.getAvailableSlots());
        station.setStatus(request.getStatus());

        Station updated = stationRepository.save(station);
        StationDTO dto = StationDTO.fromEntity(updated);

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Station updated successfully", dto)
        );
    }

    public ResponseEntity<ResponseData<Void>> deleteStation(Long id) {
        Optional<Station> station = stationRepository.findById(id);
        if (station.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Station not found", null));
        }

        stationRepository.deleteById(id);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Station deleted successfully", null)
        );
    }
    //=======================================================================================


}
