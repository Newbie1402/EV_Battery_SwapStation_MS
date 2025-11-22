package com.boilerplate.station.service;

import com.boilerplate.station.exception.AppException;
import com.boilerplate.station.exception.BusinessException;
import com.boilerplate.station.model.DTO.BatteryDTO;
import com.boilerplate.station.model.DTO.StationDTO;
import com.boilerplate.station.model.createRequest.StationCodeRequest;
import com.boilerplate.station.model.createRequest.StationRequest;
import com.boilerplate.station.model.entity.Battery;
import com.boilerplate.station.model.entity.Station;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.repository.BatteryRepository;
import com.boilerplate.station.repository.StationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StationService {

    private final StationRepository stationRepository;
    private final BatteryRepository batteryRepository;
    private final OpenStreetMapService openStreetMapService;
    private static BatteryCodeGenerator batteryCodeGenerator;

    //========================= Station CRUD Operations ========================
    public ResponseEntity<ResponseData<List<StationDTO>>> getAllStations() {
        List<StationDTO> stations = stationRepository.findAll()
                .stream()
                .map(StationDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Lấy danh sách tất cả trạm thành công", stations)
        );
    }

    public ResponseEntity<ResponseData<StationDTO>> getStationById(Long id) {
        Optional<Station> station = stationRepository.findById(id);
        if (station.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Không tìm thấy trạm", null));
        }

        StationDTO dto = StationDTO.fromEntity(station.get());
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Tìm trạm thành công", dto)
        );
    }

    public ResponseEntity<ResponseData<StationDTO>> createStation(StationRequest request) {
        try {
            var location = openStreetMapService.getCoordinatesFromAddress(request.getAddress());
            Station station = new Station();
            station.setStationCode(BatteryCodeGenerator.generateStationCode());
            station.setStationName(request.getStationName());
            station.setAddress(request.getAddress());
            station.setPhoneNumber(request.getPhoneNumber());
            station.setTotalSlots(request.getTotalSlots());
            station.setAvailableSlots(request.getAvailableSlots());
            station.setStatus(request.getStatus());
            station.setLatitude(location.latitude());
            station.setLongitude(location.longitude());

            Station saved = stationRepository.save(station);
            StationDTO dto = StationDTO.fromEntity(saved);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ResponseData<>(HttpStatus.CREATED.value(), "Tạo trạm thành công", dto));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseData<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi tạo trạm, không tìm thấy địa chỉ: " + e.getMessage(), null));
        }
    }

    // --- UPDATE STATION ---
    public ResponseEntity<ResponseData<StationDTO>> updateStation(Long id, StationRequest request) {
        Optional<Station> existing = stationRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Không tìm thấy trạm", null));
        }

        Station station = existing.get();

        // Gọi lại OpenStreetMap nếu địa chỉ thay đổi
        if (request.getAddress() != null && !request.getAddress().equals(station.getAddress())) {
            OpenStreetMapService.LocationDTO location = openStreetMapService.getCoordinatesFromAddress(request.getAddress());
            if (location != null) {
                station.setLatitude(location.latitude());
                station.setLongitude(location.longitude());
            }
        }

        station.setStationName(request.getStationName());
        station.setAddress(request.getAddress());
        station.setPhoneNumber(request.getPhoneNumber());
        station.setTotalSlots(request.getTotalSlots());
        station.setAvailableSlots(request.getAvailableSlots());
        station.setStatus(request.getStatus());

        Station updated = stationRepository.save(station);
        StationDTO dto = StationDTO.fromEntity(updated);

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Cập nhật trạm thành công", dto)
        );
    }

    public ResponseEntity<ResponseData<Void>> deleteStation(Long id) {
        Optional<Station> station = stationRepository.findById(id);
        if (station.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Không tìm thấy trạm", null));
        }

        stationRepository.deleteById(id);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Xóa trạm thành công", null)
        );
    }
    //=======================================================================================

    public ResponseEntity<ResponseData<StationDTO>> findStationBycode(StationCodeRequest code) {
        Station station = stationRepository.findByStationCode(code.getCode())
                .orElseThrow(() -> new BusinessException(AppException.STATION_NOT_FOUND));

        StationDTO dto = StationDTO.fromEntity(station);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Tìm trạm theo mã thành công", dto)
        );
    }

    @Transactional
    public ResponseEntity<ResponseData<StationDTO>> addStaffToStation(Long stationId, String staffName) {
        Optional<Station> optionalStation = stationRepository.findById(stationId);
        if (optionalStation.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(),
                            "Không tìm thấy trạm với id: " + stationId, null));
        }

        // Kiểm tra staff đã thuộc trạm khác chưa
        if (stationRepository.existsStaffInOtherStation(staffName, stationId)) {
            throw new BusinessException(AppException.STAFF_ALREADY_ASSIGNED);
        }

        Station station = optionalStation.get();
        if (station.getStaffs() == null) {
            station.setStaffs(new ArrayList<>());
        }

        if (station.getStaffs().contains(staffName)) {
            throw new BusinessException(AppException.STAFF_ALREADY_EXISTS);
        }

        station.getStaffs().add(staffName);
        Station updated = stationRepository.save(station);
        StationDTO dto = StationDTO.fromEntity(updated);

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(),
                        "Thêm nhân viên thành công vào trạm", dto)
        );
    }

    @Transactional
    public ResponseEntity<ResponseData<StationDTO>> removeStaffFromStation(Long stationId, String staffCode) {
        Optional<Station> optionalStation = stationRepository.findById(stationId);
        if (optionalStation.isEmpty()) {
            throw new BusinessException(AppException.STATION_NOT_FOUND);
        }
        Station station = optionalStation.get();
        if (station.getStaffs() == null || !station.getStaffs().contains(staffCode)) {
            throw new BusinessException(AppException.STAFF_NOT_IN_STATION);
        }
        station.getStaffs().remove(staffCode);
        Station updated = stationRepository.save(station);
        StationDTO dto = StationDTO.fromEntity(updated);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Xóa nhân viên khỏi trạm thành công", dto)
        );
    }

    public ResponseEntity<ResponseData<StationDTO>> getStation(String id) {
        Station station = stationRepository.findByStationCode(id)
                .orElseThrow(() -> new BusinessException(AppException.STATION_NOT_FOUND));
        StationDTO dto = StationDTO.fromEntity(station);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(),
                        "Lấy trạm theo mã thành công", dto)
        );
    }

    public ResponseEntity<ResponseData<StationDTO>> findStationByStaffCode(String staffCode) {
        Station station = stationRepository.findByStaffCode(staffCode)
                .orElseThrow(() -> new BusinessException(AppException.STATION_NOT_FOUND));

        StationDTO dto = StationDTO.fromEntity(station);
        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(),
                        "Tìm trạm theo mã nhân viên thành công", dto)
        );
    }

    public ResponseEntity<ResponseData<List<BatteryDTO>>> getListBatteryByStationCode(String stationCode) {
        Station station = stationRepository.findByStationCode(stationCode)
                .orElseThrow(() -> new BusinessException(AppException.STATION_NOT_FOUND));

        List<Battery> batteries = batteryRepository.findByStationId(station.getId());
        List<BatteryDTO> batteryDTOs = batteries.stream()
                .map(BatteryDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(),
                        "Lấy danh sách pin theo mã trạm thành công", batteryDTOs)
        );
    }



}
