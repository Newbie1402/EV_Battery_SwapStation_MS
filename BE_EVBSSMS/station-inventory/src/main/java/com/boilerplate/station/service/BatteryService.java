package com.boilerplate.station.service;

import com.boilerplate.station.enums.BatteryStatus;
import com.boilerplate.station.enums.OwnerType;
import com.boilerplate.station.exception.AppException;
import com.boilerplate.station.exception.BusinessException;
import com.boilerplate.station.model.DTO.BatteryDTO;
import com.boilerplate.station.model.DTO.BatterySwapLogDTO;
import com.boilerplate.station.model.createRequest.BatteryCodeRequest;
import com.boilerplate.station.model.createRequest.BatteryRequest;
import com.boilerplate.station.model.createRequest.BatterySwapLogRequest;
import com.boilerplate.station.model.createRequest.BatterySwapStationLogRequest;
import com.boilerplate.station.model.entity.Battery;

import com.boilerplate.station.model.entity.BatteryReturnLog;
import com.boilerplate.station.model.entity.BatterySwapLog;
import com.boilerplate.station.model.entity.BatterySwapStationLog;
import com.boilerplate.station.model.event.Consumer.BatteryHoldEvent;
import com.boilerplate.station.model.event.Consumer.BatterySwapEvent;
import com.boilerplate.station.model.event.Consumer.BatterySwapStation;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.repository.BatteryRepository;
import com.boilerplate.station.repository.BatteryReturnLogRepository;
import com.boilerplate.station.repository.BatterySwapLogRepository;
import com.boilerplate.station.repository.BatterySwapStationLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BatteryService {

    private final BatteryRepository batteryRepository;

    @Autowired
    private BatterySwapLogRepository batterySwapLogRepository;

    @Autowired
    private BatterySwapStationLogRepository batterySwapStationLogRepository;

    @Autowired
    private BatteryReturnLogRepository batteryReturnLogRepository;

    private static BatteryCodeGenerator batteryCodeGenerator;

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
        String code = BatteryCodeGenerator.generateRandomCode();

        Battery battery = new Battery();
        battery.setBatteryCode(code);
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
        oldBattery.setStatus(BatteryStatus.IN_STOCK);

        // Pin tram -> Xe - Pin B
        Battery newBattery = batteryRepository.findById(event.getNewBatteryId())
                .orElseThrow(() -> new RuntimeException("New battery not found"));
        newBattery.setOwnerType(OwnerType.VERHICLE);
        newBattery.setReferenceId(event.getVerhiceId());
        newBattery.setStatus(BatteryStatus.IN_USE);
        newBattery.setHold(false);

        batteryRepository.save(oldBattery);
        batteryRepository.save(newBattery);

        createSwapLog(new BatterySwapLogRequest(
                newBattery.getId(),
                oldBattery.getId(),
                event.getStationId(),
                event.getVerhiceId()
        ));

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Đổi pin thành công", null)
        );
    }

    public ResponseEntity<ResponseData<Void>> holdBattery(BatteryHoldEvent event) {
        Battery battery = batteryRepository.findById(event.getBatteryId())
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));
        if (battery.isHold()) {
            throw new BusinessException(AppException.BATTERY_HELD);
        }
        battery.setHold(true);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Giữ pin thành công", null)
        );
    }

    public ResponseEntity<ResponseData<Void>> handleBatterySwapStation(BatterySwapStation event) {
        // Pin cũ - chuyển từ trạm cũ sang trạm mới
        Battery oldBattery = batteryRepository.findById(event.getOldBatteryId())
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));
        oldBattery.setOwnerType(OwnerType.STATION);
        oldBattery.setReferenceId(event.getNewstationId());
        oldBattery.setStatus(BatteryStatus.IN_STOCK);

        // Pin mới - được cấp từ trạm mới
        Battery newBattery = batteryRepository.findById(event.getNewBatteryId())
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));
        newBattery.setOwnerType(OwnerType.STATION);
        newBattery.setReferenceId(event.getNewstationId());
        oldBattery.setStatus(BatteryStatus.IN_STOCK);

        batteryRepository.save(oldBattery);
        batteryRepository.save(newBattery);

        createSwapStationLog(new BatterySwapStationLogRequest(
                oldBattery.getId(),
                newBattery.getId(),
                event.getOldstationId(),
                event.getNewstationId()
        ));

        return ResponseEntity.ok(
                new ResponseData<>(
                        HttpStatus.OK.value(),
                        "Đổi pin giữa trạm và trạm thành công",
                        null
                )
        );
    }

    public ResponseEntity<ResponseData<BatteryDTO>> getBatteriesByBatteryCode(BatteryCodeRequest request) {
        Battery battery = batteryRepository.findByBatteryCode(request.getCode())
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));

        BatteryDTO dto = BatteryDTO.fromEntity(battery);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(),
                        "Fetched batteries for station successfully",
                        dto)
        );
    }

    public BatterySwapLog createSwapLog(BatterySwapLogRequest request) {
        Battery vehicleBattery = batteryRepository.findById(request.getVerhicleBatteryId())
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));
        Battery stationBattery = batteryRepository.findById(request.getStationBatteryId())
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));


        BatterySwapLog log = new BatterySwapLog();
        log.setVerhicleBattery(vehicleBattery);
        log.setStationBattery(stationBattery);
        log.setStationId(request.getStationId());
        log.setVerhiceId(request.getVerhicleId());
        log.setSwapTime(LocalDateTime.now());

        return batterySwapLogRepository.save(log);
    }

    public BatterySwapStationLog createSwapStationLog(BatterySwapStationLogRequest request) {
        Battery oldBattery = batteryRepository.findById(request.getOldStationBatteryId())
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));
        Battery newBattery = batteryRepository.findById(request.getNewStationBatteryId())
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));

        BatterySwapStationLog log = new BatterySwapStationLog();
        log.setOldStationBattery(oldBattery);
        log.setNewStationBattery(newBattery);
        log.setOldStationId(request.getOldStationId());
        log.setNewStationId(request.getNewStationId());
        log.setSwapTime(LocalDateTime.now());

        return batterySwapStationLogRepository.save(log);
    }

    public ResponseEntity<ResponseData<List<BatterySwapLogDTO>>> getSwapLogsByStationId(Long stationId) {
        List<BatterySwapLog> logs = batterySwapLogRepository.findByStationId(stationId);

        if (logs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Không tìm thấy log đổi pin cho trạm này", null));
        }

        List<BatterySwapLogDTO> dtos = logs.stream()
                .map(BatterySwapLogDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Lấy danh sách log đổi pin thành công", dtos)
        );
    }

    public ResponseEntity<ResponseData<List<BatterySwapLogDTO>>> getAllSwapLogs() {
        List<BatterySwapLog> logs = batterySwapLogRepository.findAll();

        if (logs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Không có log đổi pin nào trong hệ thống", null));
        }

        List<BatterySwapLogDTO> dtos = logs.stream()
                .map(BatterySwapLogDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Lấy danh sách tất cả log đổi pin thành công", dtos)
        );
    }


}
