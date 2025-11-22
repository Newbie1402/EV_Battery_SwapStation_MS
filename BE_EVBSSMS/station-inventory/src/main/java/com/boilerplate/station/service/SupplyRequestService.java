package com.boilerplate.station.service;

import com.boilerplate.station.enums.SupplyRequestStatus;
import com.boilerplate.station.model.DTO.BatterySupplyRequestDTO;
import com.boilerplate.station.model.createRequest.CreateSupplyRequest;
import com.boilerplate.station.model.entity.Battery;
import com.boilerplate.station.model.entity.BatterySupplyRequest;
import com.boilerplate.station.model.entity.Station;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.repository.BatteryRepository;
import com.boilerplate.station.repository.BatterySupplyRequestRepository;
import com.boilerplate.station.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
public class SupplyRequestService {
    private final BatterySupplyRequestRepository supplyRequestRepository;
    private final StationRepository stationRepository;
    private final BatteryRepository batteryRepository;

    public ResponseEntity<ResponseData<BatterySupplyRequestDTO>> createRequest(CreateSupplyRequest request) {
        if (request.getStationCode() == null || request.getStationCode().isBlank()) {
            throw new RuntimeException("Station code cannot be empty");
        }
        if (request.getRequestedQuantity() <= 0) {
            throw new RuntimeException("Requested quantity must be greater than 0");
        }
        if (request.getBatteryModel() == null || request.getBatteryModel().isBlank()) {
            throw new RuntimeException("Battery model cannot be empty");
        }
        Station station = stationRepository.findByStationCode(request.getStationCode())
                .orElseThrow(() -> new RuntimeException(
                        "Station with code " + request.getStationCode() + " not found"
                ));
        BatterySupplyRequest entity = BatterySupplyRequest.builder()
                .station(station)
                .requestedQuantity(request.getRequestedQuantity())
                .batteryModel(request.getBatteryModel())
                .reason(request.getReason())
                .createdAt(LocalDateTime.now())
                .status(SupplyRequestStatus.PENDING)
                .build();

        BatterySupplyRequest dto = supplyRequestRepository.save(entity);
        BatterySupplyRequestDTO dtos = BatterySupplyRequestDTO.fromEntity(dto);

        return ResponseEntity.ok(
                ResponseData.<BatterySupplyRequestDTO>builder()
                        .statusCode(200)
                        .message("Tạo yêu cầu thành công")
                        .data(dtos)
                        .build()
        );
    }

    public ResponseEntity<ResponseData<BatterySupplyRequestDTO>> updateStatus(
            Long requestId,
            SupplyRequestStatus newStatus,
            String adminNote) {

        BatterySupplyRequest request = supplyRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(newStatus);
        request.setAdminNote(adminNote);
        request.setProcessedAt(LocalDateTime.now());

        BatterySupplyRequest saved = supplyRequestRepository.save(request);

        BatterySupplyRequestDTO dto = BatterySupplyRequestDTO.fromEntity(saved);

        return ResponseEntity.ok(
                ResponseData.<BatterySupplyRequestDTO>builder()
                        .statusCode(200)
                        .message("Cập nhật trạng thái thành công")
                        .data(dto)
                        .build()
        );
    }


    public ResponseEntity<ResponseData<List<BatterySupplyRequestDTO>>> getByStationCode(String stationCode) {

        List<BatterySupplyRequestDTO> dtoList = supplyRequestRepository.findAll()
                .stream()
                .filter(r -> r.getStation() != null && stationCode.equals(r.getStation().getStationCode()))
                .map(BatterySupplyRequestDTO::fromEntity)
                .toList();

        return ResponseEntity.ok(
                ResponseData.<List<BatterySupplyRequestDTO>>builder()
                        .statusCode(200)
                        .message("Lấy danh sách yêu cầu theo stationCode thành công")
                        .data(dtoList)
                        .build()
        );
    }

    public ResponseEntity<ResponseData<Void>> transferBatteries(
            List<String> batteryCodes,
            String destinationStationCode) {
        if (batteryCodes == null || batteryCodes.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    ResponseData.<Void>builder()
                            .statusCode(400)
                            .message("Danh sách pin không được để trống")
                            .build()
            );
        }
        Station destinationStation = stationRepository.findByStationCode(destinationStationCode)
                .orElseThrow(() -> new RuntimeException(
                        "Station " + destinationStationCode + " không tồn tại"
                ));
        List<Battery> transferred = new ArrayList<>();
        for (String code : batteryCodes) {
            Battery battery = batteryRepository.findByBatteryCode(code)
                    .orElseThrow(() -> new RuntimeException("Battery " + code + " không tồn tại"));

            if (battery.isHold()) {
                throw new RuntimeException("Battery " + code + " đang bị giữ, không thể chuyển");
            }
            Station oldStation = battery.getStation();
            if (oldStation != null) {
                oldStation.getBatteries().remove(battery);
            }

            battery.setStation(destinationStation);
            battery.setOwnerType(com.boilerplate.station.enums.OwnerType.STATION);
            battery.setReferenceId(destinationStation.getStationCode());
            destinationStation.getBatteries().add(battery);
            transferred.add(batteryRepository.save(battery));
        }

        stationRepository.save(destinationStation);

        return ResponseEntity.ok(
                ResponseData.<Void>builder()
                        .statusCode(200)
                        .message("Chuyển pin thành công sang trạm " + destinationStationCode)
                        .data(null)
                        .build()
        );
    }


    public ResponseEntity<ResponseData<List<BatterySupplyRequestDTO>>> getAllRequests() {
        List<BatterySupplyRequestDTO> dtoList = supplyRequestRepository.findAll()
                .stream()
                .map(BatterySupplyRequestDTO::fromEntity)
                .toList();

        return ResponseEntity.ok(
                ResponseData.<List<BatterySupplyRequestDTO>>builder()
                        .statusCode(200)
                        .message("Lấy tất cả yêu cầu cấp pin thành công")
                        .data(dtoList)
                        .build()
        );
    }

    public ResponseEntity<ResponseData<BatterySupplyRequestDTO>> getRequestById(Long requestId) {
        BatterySupplyRequest request = supplyRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request with ID " + requestId + " not found"));

        BatterySupplyRequestDTO dto = BatterySupplyRequestDTO.fromEntity(request);

        return ResponseEntity.ok(
                ResponseData.<BatterySupplyRequestDTO>builder()
                        .statusCode(200)
                        .message("Lấy chi tiết yêu cầu thành công")
                        .data(dto)
                        .build()
        );
    }

}
