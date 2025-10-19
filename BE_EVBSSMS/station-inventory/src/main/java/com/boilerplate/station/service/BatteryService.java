package com.boilerplate.station.service;

import com.boilerplate.station.enums.BatteryStatus;
import com.boilerplate.station.enums.OwnerType;
import com.boilerplate.station.model.DTO.BatteryDTO;
import com.boilerplate.station.model.createRequest.BatteryRequest;
import com.boilerplate.station.model.entity.Battery;

import com.boilerplate.station.model.event.Consumer.BatteryHoldEvent;
import com.boilerplate.station.model.event.Consumer.BatterySwapEvent;
import com.boilerplate.station.model.event.Consumer.BatterySwapStation;
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



    public ResponseEntity<ResponseData<Void>> handleBatterySwap(BatterySwapEvent event) {
        // Pin Xe -> Trạm - Pin A
        Battery oldBattery = batteryRepository.findById(event.getOldBatteryId())
                .orElseThrow(() -> new RuntimeException("Old battery not found"));
        oldBattery.setOwnerType(OwnerType.STATION);
        oldBattery.setReferenceId(event.getStationId());

        // Pin tram -> Xe - Pin B
        Battery newBattery = batteryRepository.findById(event.getNewBatteryId())
                .orElseThrow(() -> new RuntimeException("New battery not found"));
        newBattery.setOwnerType(OwnerType.VERHICLE);
        newBattery.setReferenceId(event.getVerhiceId());
        newBattery.setStatus(BatteryStatus.IN_USE);

        batteryRepository.save(oldBattery);
        batteryRepository.save(newBattery);

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Đổi pin thành công", null)
        );
    }

    public ResponseEntity<ResponseData<Void>> holdBattery(BatteryHoldEvent event) {
        Battery battery = batteryRepository.findById(event.getBatteryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy pin với ID: " + event.getBatteryId()));
        if (battery.isHold()) {
            throw new RuntimeException("Pin này đã được giữ trước đó!");
        }
        battery.setHold(true);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Giữ pin thành công", null)
        );
    }

    public ResponseEntity<ResponseData<Void>> handleBatterySwapStation(BatterySwapStation event) {
        // Pin cũ - chuyển từ trạm cũ sang trạm mới
        Battery oldBattery = batteryRepository.findById(event.getOldBatteryId())
                .orElseThrow(() -> new RuntimeException("Old battery not found"));
        oldBattery.setOwnerType(OwnerType.STATION);
        oldBattery.setReferenceId(event.getNewstationId());

        // Pin mới - được cấp từ trạm mới
        Battery newBattery = batteryRepository.findById(event.getNewBatteryId())
                .orElseThrow(() -> new RuntimeException("New battery not found"));
        newBattery.setOwnerType(OwnerType.STATION);
        newBattery.setReferenceId(event.getNewstationId());

        batteryRepository.save(oldBattery);
        batteryRepository.save(newBattery);

        return ResponseEntity.ok(
                new ResponseData<>(
                        HttpStatus.OK.value(),
                        String.format("Đổi pin giữa trạm %d và trạm %d thành công",
                                event.getOldstationId(), event.getNewstationId()),
                        null
                )
        );
    }


}
