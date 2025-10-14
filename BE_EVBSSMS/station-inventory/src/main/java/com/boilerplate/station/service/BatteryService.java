package com.boilerplate.station.service;

import com.boilerplate.station.model.DTO.BatteryDTO;
import com.boilerplate.station.model.createRequest.BatteryRequest;
import com.boilerplate.station.model.entity.Battery;

import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.repository.BatteryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BatteryService {

    private final BatteryRepository batteryRepository;

    public ResponseEntity<ResponseData<List<BatteryDTO>>> getAllBatteries() {
        List<BatteryDTO> batteries = batteryRepository.findAll()
                .stream()
                .map(BatteryDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Fetched all batteries successfully", batteries)
        );
    }

    public ResponseEntity<ResponseData<BatteryDTO>> getBatteryById(Long id) {
        Optional<Battery> battery = batteryRepository.findById(id);
        if (battery.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Battery not found", null));
        }
        BatteryDTO dto = BatteryDTO.fromEntity(battery.get());
        return ResponseEntity.ok(new ResponseData<>(HttpStatus.OK.value(), "Battery found", dto));
    }

    public ResponseEntity<ResponseData<BatteryDTO>> createBattery(BatteryRequest request) {
        Battery battery = new Battery();
        battery.setBatteryCode(request.getBatteryCode());
        battery.setModel(request.getModel());
        battery.setCapacity(request.getCapacity());
        battery.setSoh(request.getSoh());
        battery.setSoc(request.getSoc());
        battery.setStatus(request.getStatus());
        battery.setOwnerType(request.getOwnerType());
        battery.setReferenceId(request.getReferenceId());

        Battery saved = batteryRepository.save(battery);
        BatteryDTO dto = BatteryDTO.fromEntity(saved);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseData<>(HttpStatus.CREATED.value(), "Battery created successfully", dto));
    }

    public ResponseEntity<ResponseData<BatteryDTO>> updateBattery(Long id, BatteryRequest request) {
        Optional<Battery> existing = batteryRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Battery not found", null));
        }

        Battery battery = existing.get();
        battery.setBatteryCode(request.getBatteryCode());
        battery.setModel(request.getModel());
        battery.setCapacity(request.getCapacity());
        battery.setSoh(request.getSoh());
        battery.setSoc(request.getSoc());
        battery.setStatus(request.getStatus());
        battery.setOwnerType(request.getOwnerType());
        battery.setReferenceId(request.getReferenceId());

        Battery updated = batteryRepository.save(battery);
        BatteryDTO dto = BatteryDTO.fromEntity(updated);

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Battery updated successfully", dto)
        );
    }

    public ResponseEntity<ResponseData<Void>> deleteBattery(Long id) {
        Optional<Battery> battery = batteryRepository.findById(id);
        if (battery.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Battery not found", null));
        }

        batteryRepository.deleteById(id);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Battery deleted successfully", null)
        );
    }



    public void handleBatterySwap(BatterySwapEvent event) {
        // Pin cũ -> Trạm
        Battery oldBattery = batteryRepository.findById(event.getOldBatteryId())
                .orElseThrow(() -> new RuntimeException("Old battery not found"));
        oldBattery.setOwnerType(OwnerType.STATION);
        oldBattery.setReferenceId(event.getSwapStationId());
        oldBattery.setStatus(BatteryStatus.CHARGING);

        // Pin mới -> Xe
        Battery newBattery = batteryRepository.findById(event.getNewBatteryId())
                .orElseThrow(() -> new RuntimeException("New battery not found"));
        newBattery.setOwnerType(OwnerType.VEHICLE);
        newBattery.setReferenceId(event.getOldOwnerId());
        newBattery.setStatus(BatteryStatus.IN_USE);

        batteryRepository.save(oldBattery);
        batteryRepository.save(newBattery);
    }


}
