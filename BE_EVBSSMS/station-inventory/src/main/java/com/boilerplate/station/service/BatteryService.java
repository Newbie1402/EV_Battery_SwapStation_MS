package com.boilerplate.station.service;

import com.boilerplate.station.enums.BatteryStatus;
import com.boilerplate.station.enums.OwnerType;
import com.boilerplate.station.exception.AppException;
import com.boilerplate.station.exception.BusinessException;
import com.boilerplate.station.model.DTO.BatteryDTO;
import com.boilerplate.station.model.DTO.BatteryReturnLogDTO;
import com.boilerplate.station.model.DTO.BatterySwapLogDTO;
import com.boilerplate.station.model.createRequest.*;
import com.boilerplate.station.model.entity.*;

import com.boilerplate.station.model.event.Consumer.BatteryHoldEvent;
import com.boilerplate.station.model.event.Consumer.BatterySwapEvent;
import com.boilerplate.station.model.event.Consumer.BatterySwapStation;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BatteryService {

    private final BatteryRepository batteryRepository;

    @Autowired
    private BatterySwapLogRepository batterySwapLogRepository;

    @Autowired
    private BatterySwapStationLogRepository batterySwapStationLogRepository;

    @Autowired
    private BatteryReturnLogRepository batteryReturnLogRepository;

    @Autowired
    private StationRepository stationRepository;

    private final RestTemplate restTemplate;

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
        String code = BatteryCodeGenerator.generateBatteryCode();

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
        Battery oldBattery = batteryRepository.findByBatteryCode(event.getOldBatteryId())
                .orElseThrow(() -> new RuntimeException("Old battery not found"));
        Station station = stationRepository.findByStationCode(event.getStationId())
                .orElseThrow(() -> new RuntimeException("Station not found"));
        oldBattery.setOwnerType(OwnerType.STATION);
        oldBattery.setReferenceId(event.getStationId());
        oldBattery.setStatus(BatteryStatus.IN_STOCK);
        oldBattery.setStation(station);
        station.getBatteries().add(oldBattery);
        // Pin mới -> Xe
        // Pin tram -> Xe - Pin B
        Battery newBattery = batteryRepository.findByBatteryCode(event.getNewBatteryId())
                .orElseThrow(() -> new RuntimeException("New battery not found"));
        newBattery.setOwnerType(OwnerType.VEHICLE);
        newBattery.setReferenceId(event.getVerhiceId());
        newBattery.setStatus(BatteryStatus.IN_CAR);
        station.getBatteries().removeIf(b -> b.getBatteryCode().equals(oldBattery.getBatteryCode()));
        newBattery.setStation(null);

        batteryRepository.save(oldBattery);
        batteryRepository.save(newBattery);

        createSwapLog(new BatterySwapLogRequest(

        ));

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Đổi pin thành công", null)
        );
    }


    public ResponseEntity<ResponseData<Void>> handleBatterySwapStation(BatterySwapStation event) {
        // Pin cũ - chuyển từ trạm cũ sang trạm mới
        Battery oldBattery = batteryRepository.findByBatteryCode(event.getBatteryId())
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));
        oldBattery.setOwnerType(OwnerType.STATION);
        oldBattery.setReferenceId(event.getNewstationId());
        oldBattery.setStatus(BatteryStatus.IN_STOCK);


        Station newstation = stationRepository.findByStationCode(event.getNewstationId())
                .orElseThrow(() -> new BusinessException(AppException.STATION_NOT_FOUND));
        Station oldstation = stationRepository.findByStationCode(event.getNewstationId())
                .orElseThrow(() -> new BusinessException(AppException.STATION_NOT_FOUND));

        oldstation.getBatteries().removeIf(b -> b.getBatteryCode().equals(oldBattery.getBatteryCode()));;

        newstation.getBatteries().add(oldBattery);

        oldBattery.setStation(newstation);

        batteryRepository.save(oldBattery);
        stationRepository.save(newstation);
        stationRepository.save(oldstation);

        createSwapStationLog(new BatterySwapStationLogRequest(
                oldBattery.getBatteryCode(),
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



    public ResponseEntity<ResponseData<Void>> holdBattery(BatteryHoldEvent event) {
        Battery battery = batteryRepository.findByBatteryCode(event.getBatteryCode())
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));
        if (battery.isHold()) {
            throw new BusinessException(AppException.BATTERY_HELD);
        }
        battery.setHold(true);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Giữ pin thành công", null)
        );
    }



    public ResponseEntity<ResponseData<BatteryDTO>> getBatteriesByBatteryCode(BatteryCodeRequest request) {
        Battery battery = batteryRepository.findByBatteryCode(request.getCode())
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));

        BatteryDTO dto = BatteryDTO.fromEntity(battery);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(),
                        "Lấy pin thành công",
                        dto)
        );
    }


    public BatterySwapStationLog createSwapStationLog(BatterySwapStationLogRequest request) {
        Battery oldBattery = batteryRepository.findByBatteryCode(request.getBatteryCode())
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));

        BatterySwapStationLog log = new BatterySwapStationLog();
        log.setBattery(oldBattery);
        log.setOldStationId(request.getOldStationCode());
        log.setNewStationId(request.getNewStationCode());
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

    public BatterySwapLog createSwapLog(BatterySwapLogRequest request) {
        Battery vehicleBattery = batteryRepository.findByBatteryCode(request.getVerhicleBatteryCode())
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));
        Battery stationBattery = batteryRepository.findByBatteryCode(request.getStationBatteryCode())
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));
        Station station = stationRepository.findByStationCode(request.getStationCode())
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));

        BatterySwapLog log = new BatterySwapLog();
        log.setVerhicleBattery(vehicleBattery);
        log.setStationBattery(stationBattery);
        log.setStation(station);
        log.setVehiceId(request.getVerhicleCode());
        log.setSwapTime(LocalDateTime.now());

        return batterySwapLogRepository.save(log);
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

    public ResponseEntity<ResponseData<BatteryDTO>> addBattery(AddBatteryRequest request) {
        Station station = stationRepository.findByStationCode(request.getStationCode())
                .orElseThrow(() -> new BusinessException(AppException.STATION_NOT_FOUND));
        Battery battery = batteryRepository.findByBatteryCode(request.getBatteryCode())
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));
        if (battery.getStation() != null &&
                !battery.getStation().getStationCode().equals(request.getStationCode())) {
            throw new RuntimeException(("Pin đang thuộc trạm khác!"));
        }
        battery.setStation(station);
        battery.setReferenceId(station.getStationCode());
        battery.setStatus(BatteryStatus.IN_USE);
        Battery saved = batteryRepository.save(battery);
        station.getBatteries().add(saved);

        stationRepository.save(station);
        BatteryDTO dto = BatteryDTO.fromEntity(saved);
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ResponseData<>(
                        HttpStatus.OK.value(),
                        "Thêm pin vào trạm thành công",
                        dto
                ));
    }



    public ResponseEntity<ResponseData<BatteryReturnLogDTO>> createLog(BatteryReturnLogRequest request, Long Id) {
        Optional<Battery> batteryOpt = batteryRepository.findById(request.getBatteryId());
        if (batteryOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Battery không tồn tại", null));
        }

        BatterySwapLog swapLog = batterySwapLogRepository.findById(Id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));


        BatteryReturnLog log = BatteryReturnLog.builder()
                .bookingId(request.getBookingId())
                .customerId(request.getCustomerId())
                .stationId(request.getStationId())
                .battery(batteryOpt.get())
                .condition(request.getCondition())
                .Description(request.getDescription())
                .note(request.getNote())
                .returnTime(request.getReturnTime())
                .build();

        BatteryReturnLog saved = batteryReturnLogRepository.save(log);

        BatterySwapLog swap = new BatterySwapLog();
        swap.setBatteryReturnLog(saved);

        batterySwapLogRepository.save(swap);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseData<>(HttpStatus.CREATED.value(), "Tạo log trả pin thành công", BatteryReturnLogDTO.fromEntity(saved)));
    }

    public ResponseEntity<ResponseData<BatteryReturnLogDTO>> updateLog(Long id, BatteryReturnLogRequest request) {
        Optional<BatteryReturnLog> logOpt = batteryReturnLogRepository.findById(id);
        if (logOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Log trả pin không tồn tại", null));
        }

        BatteryReturnLog log = logOpt.get();

        if (request.getBatteryId() != null) {
            Optional<Battery> batteryOpt = batteryRepository.findById(request.getBatteryId());
            if (batteryOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Battery không tồn tại", null));
            }
            log.setBattery(batteryOpt.get());
        }

        log.setBookingId(request.getBookingId());
        log.setCustomerId(request.getCustomerId());
        log.setStationId(request.getStationId());
        log.setCondition(request.getCondition());
        log.setDescription(request.getDescription());
        log.setNote(request.getNote());
        log.setReturnTime(request.getReturnTime());

        BatteryReturnLog updated = batteryReturnLogRepository.save(log);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Cập nhật log trả pin thành công", BatteryReturnLogDTO.fromEntity(updated))
        );
    }

}
