package com.boilerplate.auth.service;

import com.boilerplate.auth.enums.VehicleStatus;
import com.boilerplate.auth.exception.DuplicateResourceException;
import com.boilerplate.auth.exception.ResourceNotFoundException;
import com.boilerplate.auth.model.request.AddVehicleRequest;
import com.boilerplate.auth.model.dto.request.UpdateVehicleRequest;
import com.boilerplate.auth.model.dto.response.VehicleResponse;
import com.boilerplate.auth.entity.User;
import com.boilerplate.auth.entity.Vehicle;
import com.boilerplate.auth.repository.UserRepository;
import com.boilerplate.auth.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý nghiệp vụ liên quan đến phương tiện
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    /**
     * Thêm phương tiện cho user
     */
    @Transactional
    public VehicleResponse addVehicle(Long userId, AddVehicleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        // Kiểm tra VIN đã tồn tại chưa
        if (vehicleRepository.existsByVin(request.getVin())) {
            throw new DuplicateResourceException("VIN đã tồn tại trong hệ thống");
        }

        // Kiểm tra biển số đã tồn tại chưa
        if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new DuplicateResourceException("Biển số xe đã tồn tại trong hệ thống");
        }

        Vehicle vehicle = Vehicle.builder()
                .vin(request.getVin())
                .model(request.getModel())
                .licensePlate(request.getLicensePlate())
                .batteryType(request.getBatteryType())
                .batteryCapacity(request.getBatteryCapacity())
                .status(VehicleStatus.ACTIVE)
                .user(user)
                .build();

        vehicle = vehicleRepository.save(vehicle);
        log.info("Đã thêm phương tiện mới cho user {}: VIN {}", userId, vehicle.getVin());

        return mapToResponse(vehicle);
    }

    /**
     * Lấy danh sách phương tiện của user
     */
    public List<VehicleResponse> getUserVehicles(Long userId) {
        return vehicleRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thông tin chi tiết phương tiện
     */
    public VehicleResponse getVehicleById(Long vehicleId, Long userId) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phương tiện"));

        return mapToResponse(vehicle);
    }

    /**
     * Cập nhật thông tin phương tiện
     */
    @Transactional
    public VehicleResponse updateVehicle(Long vehicleId, Long userId, UpdateVehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phương tiện"));

        // Cập nhật các trường nếu có
        if (request.getModel() != null) {
            vehicle.setModel(request.getModel());
        }
        if (request.getLicensePlate() != null) {
            // Kiểm tra biển số mới đã tồn tại chưa (trừ xe hiện tại)
            vehicleRepository.findByLicensePlate(request.getLicensePlate())
                    .ifPresent(existingVehicle -> {
                        if (!existingVehicle.getId().equals(vehicleId)) {
                            throw new DuplicateResourceException("Biển số xe đã tồn tại");
                        }
                    });
            vehicle.setLicensePlate(request.getLicensePlate());
        }
        if (request.getBatteryType() != null) {
            vehicle.setBatteryType(request.getBatteryType());
        }
        if (request.getBatteryCapacity() != null) {
            vehicle.setBatteryCapacity(request.getBatteryCapacity());
        }
        if (request.getStatus() != null) {
            vehicle.setStatus(request.getStatus());
        }

        vehicle = vehicleRepository.save(vehicle);
        log.info("Đã cập nhật thông tin phương tiện ID: {}", vehicleId);

        return mapToResponse(vehicle);
    }

    /**
     * Xóa phương tiện (soft delete - chuyển trạng thái thành INACTIVE)
     */
    @Transactional
    public void deleteVehicle(Long vehicleId, Long userId) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phương tiện"));

        vehicle.setStatus(VehicleStatus.INACTIVE);
        vehicleRepository.save(vehicle);
        log.info("Đã xóa phương tiện ID: {}", vehicleId);
    }


    private VehicleResponse mapToResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .vin(vehicle.getVin())
                .model(vehicle.getModel())
                .licensePlate(vehicle.getLicensePlate())
                .batteryType(vehicle.getBatteryType())
                .batteryCapacity(vehicle.getBatteryCapacity())
                .status(vehicle.getStatus())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}
