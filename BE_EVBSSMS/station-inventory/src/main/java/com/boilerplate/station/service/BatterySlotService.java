package com.boilerplate.station.service;

import com.boilerplate.station.enums.BatteryStatus;
import com.boilerplate.station.enums.SlotStatus;
import com.boilerplate.station.exception.AppException;
import com.boilerplate.station.exception.BusinessException;
import com.boilerplate.station.model.DTO.BatterySlotDTO;
import com.boilerplate.station.model.DTO.ChargeLogDTO;
import com.boilerplate.station.model.createRequest.BatterySlotRequest;
import com.boilerplate.station.model.entity.Battery;
import com.boilerplate.station.model.entity.BatterySlot;
import com.boilerplate.station.model.entity.ChargeLog;
import com.boilerplate.station.model.entity.Station;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.repository.BatteryRepository;
import com.boilerplate.station.repository.BatterySlotRepository;
import com.boilerplate.station.repository.ChargeLogRepository;
import com.boilerplate.station.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BatterySlotService {

    private final BatterySlotRepository batterySlotRepository;
    private final StationRepository stationRepository;
    private final BatteryRepository batteryRepository;
    private final ChargeLogRepository chargeLogRepository;

    // ========================= GET ALL =========================
    public ResponseEntity<ResponseData<List<BatterySlotDTO>>> getAllSlots() {
        List<BatterySlotDTO> slots = batterySlotRepository.findAll()
                .stream()
                .map(BatterySlotDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Fetched all battery slots successfully", slots)
        );
    }

    // ========================= GET BY ID =========================
    public ResponseEntity<ResponseData<BatterySlotDTO>> getSlotById(Long id) {
        BatterySlot slot = batterySlotRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.SLOT_NOT_FOUND));

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Battery slot found", BatterySlotDTO.fromEntity(slot))
        );
    }

    // ========================= CREATE =========================
    public ResponseEntity<ResponseData<BatterySlotDTO>> createSlot(BatterySlotRequest request) {

        // 🔹 Tìm station
        Station station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new BusinessException(AppException.STATION_NOT_FOUND));

        // 🔹 Tìm battery (nếu có)
        Battery battery = null;
        if (request.getBatteryId() != null) {
            battery = batteryRepository.findById(request.getBatteryId())
                    .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));
        }

        // 🔹 Tạo slot
        BatterySlot slot = new BatterySlot();
        slot.setSlotCode(request.getSlotCode());
        slot.setStation(station);

        if (battery == null) {
            slot.setBattery(null);
            slot.setAvailable(true);
            slot.setStatus(SlotStatus.EMPTY);
        } else {
            slot.setBattery(battery);
            slot.setAvailable(false);
            slot.setStatus(SlotStatus.OCCUPIED);
        }

        BatterySlot saved = batterySlotRepository.save(slot);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseData<>(HttpStatus.CREATED.value(), "Battery slot created successfully", BatterySlotDTO.fromEntity(saved)));
    }

    // ========================= UPDATE =========================
    public ResponseEntity<ResponseData<BatterySlotDTO>> updateSlot(Long id, BatterySlotRequest request) {

        BatterySlot slot = batterySlotRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.SLOT_NOT_FOUND));

        Station station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new BusinessException(AppException.STATION_NOT_FOUND));

        Battery battery = null;
        if (request.getBatteryId() != null) {
            battery = batteryRepository.findById(request.getBatteryId())
                    .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));
        }

        slot.setSlotCode(request.getSlotCode());
        slot.setStation(station);

        if (battery == null) {
            slot.setBattery(null);
            slot.setAvailable(true);
            slot.setStatus(SlotStatus.EMPTY);
        } else {
            slot.setBattery(battery);
            slot.setAvailable(false);
            slot.setStatus(SlotStatus.OCCUPIED);
        }

        BatterySlot updated = batterySlotRepository.save(slot);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Battery slot updated successfully", BatterySlotDTO.fromEntity(updated))
        );
    }

    // ========================= DELETE =========================
    public ResponseEntity<ResponseData<Void>> deleteSlot(Long id) {
        BatterySlot slot = batterySlotRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.SLOT_NOT_FOUND));

        batterySlotRepository.delete(slot);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Battery slot deleted successfully", null)
        );
    }

    // ========================= ASSIGN BATTERY TO SLOT =========================
    public ResponseEntity<ResponseData<BatterySlotDTO>> assignBatteryToSlot(Long slotId, Long batteryId) {
        BatterySlot slot = batterySlotRepository.findById(slotId)
                .orElseThrow(() -> new BusinessException(AppException.SLOT_NOT_FOUND));
        Battery battery = batteryRepository.findById(batteryId)
                .orElseThrow(() -> new BusinessException(AppException.BATTERY_NOT_FOUND));
        if (!slot.isAvailable() || slot.getStatus() == SlotStatus.OCCUPIED) {
            throw new BusinessException(AppException.SLOT_OCCUPIED);
        }

        battery.setStatus(BatteryStatus.CHARGING);

        slot.setBattery(battery);
        slot.setAvailable(false);
        slot.setStatus(SlotStatus.OCCUPIED);

        BatterySlot updated = batterySlotRepository.save(slot);

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(),
                        "Battery assigned to slot successfully",
                        BatterySlotDTO.fromEntity(updated))
        );
    }

    // ========================= SET SLOT EMPTY (REMOVE BATTERY FULL CHARGE) =========================
    public ResponseEntity<ResponseData<BatterySlotDTO>> setSlotEmpty(Long slotId) {

        BatterySlot slot = batterySlotRepository.findById(slotId)
                .orElseThrow(() -> new BusinessException(AppException.SLOT_NOT_FOUND));

        if (slot.isAvailable() || slot.getStatus() == SlotStatus.EMPTY) {
            throw new BusinessException(AppException.SLOT_EMPTY);
        }

        createChargeLog(
                slot.getBattery(),
                slot,
                slot.getStation(),
                slot.getBattery().getSoc(),
                100.0,
                null,
                LocalDateTime.now()
        );

        slot.getBattery().setSoc(100.0);
        slot.getBattery().setStatus((BatteryStatus.FULL));
        slot.setBattery(null);
        slot.setStatus(SlotStatus.EMPTY);
        slot.setAvailable(true);

        BatterySlot updated = batterySlotRepository.save(slot);



        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(),
                        "Battery removed from slot successfully",
                        BatterySlotDTO.fromEntity(updated))
        );
    }

    public void createChargeLog(Battery battery,
                                     BatterySlot slot,
                                     Station station,
                                     double socBefore,
                                     double socAfter,
                                     LocalDateTime startTime,
                                     LocalDateTime endTime) {

        if (socAfter < socBefore) {
            throw new IllegalArgumentException("socAfter phải lớn hơn hoặc bằng socBefore");
        }

        double capacityWh = battery.getCapacity();  // dung lượng pin (Wh)
        double soh = battery.getSoh();                // trạng thái sức khỏe pin (%)
        double energyConsumed = ChargeLog.calculateEnergyConsumed(capacityWh, soh, socBefore, socAfter);

        ChargeLog chargeLog = new ChargeLog();
        chargeLog.setBattery(battery);
        chargeLog.setSlot(slot);
        chargeLog.setStation(station);
        chargeLog.setSocBefore(socBefore);
        chargeLog.setSocAfter(socAfter);
        chargeLog.setEnergyConsumed(energyConsumed);
        chargeLog.setStartTime(startTime);
        chargeLog.setEndTime(endTime);

        chargeLogRepository.save(chargeLog);
    }

    public ResponseEntity<ResponseData<List<ChargeLogDTO>>> getAllChargeLogs() {
        List<ChargeLog> logs = chargeLogRepository.findAll();
        List<ChargeLogDTO> dtoList = logs.stream()
                .map(ChargeLogDTO::fromEntity)
                .toList();

        ResponseData<List<ChargeLogDTO>> response = ResponseData.<List<ChargeLogDTO>>builder()
                .statusCode(200)
                .message("Lấy danh sách ChargeLog thành công")
                .data(dtoList)
                .build();

        return ResponseEntity.ok(response);
    }


}
