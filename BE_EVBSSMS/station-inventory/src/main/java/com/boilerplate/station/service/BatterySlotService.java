package com.boilerplate.station.service;

import com.boilerplate.station.model.DTO.BatterySlotDTO;
import com.boilerplate.station.model.createRequest.BatterySlotRequest;
import com.boilerplate.station.model.entity.Battery;
import com.boilerplate.station.model.entity.BatterySlot;
import com.boilerplate.station.model.entity.Station;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.repository.BatteryRepository;
import com.boilerplate.station.repository.BatterySlotRepository;
import com.boilerplate.station.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BatterySlotService {

    private final BatterySlotRepository batterySlotRepository;
    private final StationRepository stationRepository;
    private final BatteryRepository batteryRepository;

    public ResponseEntity<ResponseData<List<BatterySlotDTO>>> getAllSlots() {
        List<BatterySlotDTO> slots = batterySlotRepository.findAll()
                .stream()
                .map(BatterySlotDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Fetched all battery slots successfully", slots)
        );
    }

    public ResponseEntity<ResponseData<BatterySlotDTO>> getSlotById(Long id) {
        Optional<BatterySlot> slot = batterySlotRepository.findById(id);
        if (slot.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Battery slot not found", null));
        }

        BatterySlotDTO dto = BatterySlotDTO.fromEntity(slot.get());
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Battery slot found", dto)
        );
    }

    public ResponseEntity<ResponseData<BatterySlotDTO>> createSlot(BatterySlotRequest request) {
        // 🔹 Tìm Station theo ID
        Optional<Station> stationOpt = stationRepository.findById(request.getStationId());
        if (stationOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Station not found", null));
        }

        // 🔹 Tìm Battery theo ID (nếu có)
        Battery battery = null;
        if (request.getBatteryId() != null) {
            battery = batteryRepository.findById(request.getBatteryId()).orElse(null);
            if (battery == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Battery not found", null));
            }
        }

        // 🔹 Tạo slot mới
        BatterySlot slot = new BatterySlot();
        slot.setSlotCode(request.getSlotCode());
        slot.setAvailable(request.isAvailable());
        slot.setStatus(request.getStatus());
        slot.setStation(stationOpt.get());
        slot.setBattery(battery);

        BatterySlot saved = batterySlotRepository.save(slot);
        BatterySlotDTO dto = BatterySlotDTO.fromEntity(saved);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseData<>(HttpStatus.CREATED.value(), "Battery slot created successfully", dto));
    }

    public ResponseEntity<ResponseData<BatterySlotDTO>> updateSlot(Long id, BatterySlotRequest request) {
        Optional<BatterySlot> existing = batterySlotRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Battery slot not found", null));
        }

        // 🔹 Tìm Station
        Optional<Station> stationOpt = stationRepository.findById(request.getStationId());
        if (stationOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Station not found", null));
        }

        // 🔹 Tìm Battery (nếu có)
        Battery battery = null;
        if (request.getBatteryId() != null) {
            battery = batteryRepository.findById(request.getBatteryId()).orElse(null);
            if (battery == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Battery not found", null));
            }
        }

        BatterySlot slot = existing.get();
        slot.setSlotCode(request.getSlotCode());
        slot.setAvailable(request.isAvailable());
        slot.setStatus(request.getStatus());
        slot.setStation(stationOpt.get());
        slot.setBattery(battery);

        BatterySlot updated = batterySlotRepository.save(slot);
        BatterySlotDTO dto = BatterySlotDTO.fromEntity(updated);

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Battery slot updated successfully", dto)
        );
    }

    public ResponseEntity<ResponseData<Void>> deleteSlot(Long id) {
        Optional<BatterySlot> slot = batterySlotRepository.findById(id);
        if (slot.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Battery slot not found", null));
        }

        batterySlotRepository.deleteById(id);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Battery slot deleted successfully", null)
        );
    }
}
