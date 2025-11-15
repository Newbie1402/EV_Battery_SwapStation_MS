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
import com.boilerplate.auth.util.VehicleIdGenerator;
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
    private final VehicleIdGenerator vehicleIdGenerator;
    private final VehicleImageService vehicleImageService;

    /**
     * Thêm phương tiện mới vào hệ thống (chưa gán cho tài xế nào)
     * Chỉ admin mới có quyền thực hiện
     */
    @Transactional
    public VehicleResponse addVehicle(AddVehicleRequest request) {
        // Kiểm tra VIN đã tồn tại chưa
        if (vehicleRepository.existsByVin(request.getVin())) {
            throw new DuplicateResourceException("VIN đã tồn tại trong hệ thống");
        }

        // Kiểm tra biển số đã tồn tại chưa
        if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new DuplicateResourceException("Biển số xe đã tồn tại trong hệ thống");
        }

        // Sinh vehicleId tự động
        String vehicleId = vehicleIdGenerator.generateVehicleId(
            request.getLicensePlate(),
            request.getModel()
        );

        Vehicle vehicle = Vehicle.builder()
                .vehicleId(vehicleId)
                .vin(request.getVin())
                .model(request.getModel())
                .licensePlate(request.getLicensePlate())
                .batteryType(request.getBatteryType())
                .batteryCapacity(request.getBatteryCapacity())
                .status(VehicleStatus.ACTIVE)
                .user(null) // Chưa gán cho tài xế nào
                .build();

        vehicle = vehicleRepository.save(vehicle);
        log.info("Đã thêm phương tiện mới vào hệ thống: VIN {}", vehicle.getVin());

        return mapToResponse(vehicle);
    }

    /**
     * Lấy danh sách phương tiện của user theo employeeId
     */
    public List<VehicleResponse> getUserVehicles(String employeeId) {
        log.info("Lấy danh sách vehicles cho employeeId={}", employeeId);

        if (employeeId == null || employeeId.isBlank()) {
            log.warn("EmployeeId là NULL hoặc blank!");
            return List.of(); // Trả về list rỗng thay vì throw exception
        }

        List<Vehicle> vehicles = vehicleRepository.findByUserEmployeeId(employeeId);
        log.info("Tìm thấy {} vehicles cho employeeId={}", vehicles.size(), employeeId);

        return vehicles.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả phương tiện trong hệ thống (cho admin)
     */
    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách phương tiện chưa được cấp phát (chưa có chủ)
     */
    public List<VehicleResponse> getUnassignedVehicles() {
        return vehicleRepository.findByUserIsNull().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thông tin chi tiết phương tiện theo vehicleId (cho driver)
     * Driver chỉ xem được xe của mình
     */
    public VehicleResponse getVehicleById(String vehicleId, String employeeId) {
        log.info("Tìm vehicle với vehicleId={} và employeeId={}", vehicleId, employeeId);

        // Nếu employeeId null, trả về empty (không throw exception)
        if (employeeId == null || employeeId.isBlank()) {
            log.warn("EmployeeId là NULL hoặc blank! User có thể chưa được cấp mã nhân viên.");
            throw new ResourceNotFoundException("Không tìm thấy phương tiện hoặc bạn chưa được cấp mã nhân viên");
        }

        Vehicle vehicle = vehicleRepository.findByVehicleIdAndUserEmployeeId(vehicleId, employeeId)
                .orElseThrow(() -> {
                    log.error("Không tìm thấy vehicle với vehicleId={} và employeeId={}", vehicleId, employeeId);
                    return new ResourceNotFoundException("Không tìm thấy phương tiện hoặc phương tiện không thuộc về bạn");
                });

        log.info("Tìm thấy vehicle: vehicleId={}, vin={}, owner={}",
            vehicle.getVehicleId(), vehicle.getVin(), vehicle.getUser() != null ? vehicle.getUser().getEmployeeId() : "NULL");

        return mapToResponse(vehicle);
    }

    /**
     * Lấy thông tin chi tiết phương tiện theo vehicleId (cho admin)
     */
    public VehicleResponse getVehicleByVehicleId(String vehicleId) {
        Vehicle vehicle = vehicleRepository.findByVehicleId(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phương tiện"));

        return mapToResponse(vehicle);
    }

    /**
     * Cập nhật thông tin phương tiện và cấp phát cho tài xế
     * Admin có thể cấp phát phương tiện bằng cách nhập employeeId của tài xế
     */
    @Transactional
    public VehicleResponse updateVehicle(String vehicleId, UpdateVehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findByVehicleId(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phương tiện"));

        // Nếu có employeeId, gán phương tiện cho tài xế đó
        if (request.getEmployeeId() != null && !request.getEmployeeId().isBlank()) {
            User driver = userRepository.findByEmployeeId(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy tài xế với mã nhân viên: " + request.getEmployeeId()));

            // Kiểm tra user có phải là tài xế không
            if (!driver.getRole().name().equals("DRIVER")) {
                throw new IllegalArgumentException(
                        "Chỉ có thể cấp phát phương tiện cho tài xế (role DRIVER)");
            }

            vehicle.setUser(driver);
            log.info("Đã cấp phát phương tiện ID {} cho tài xế {}", vehicleId, request.getEmployeeId());
        }

        // Cập nhật các trường khác nếu có
        if (request.getModel() != null) {
            vehicle.setModel(request.getModel());
        }
        if (request.getLicensePlate() != null) {
            // Kiểm tra biển số mới đã tồn tại chưa (trừ xe hiện tại)
            vehicleRepository.findByLicensePlate(request.getLicensePlate())
                    .ifPresent(existingVehicle -> {
                        if (!existingVehicle.getVehicleId().equals(vehicleId)) {
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
    public void deleteVehicle(String vehicleId) {
        Vehicle vehicle = vehicleRepository.findByVehicleId(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phương tiện"));

        vehicle.setStatus(VehicleStatus.INACTIVE);
        vehicleRepository.save(vehicle);
        log.info("Đã xóa phương tiện ID: {}", vehicleId);
    }

    /**
     * Thu hồi phương tiện từ tài xế (bỏ gán user)
     */
    @Transactional
    public VehicleResponse revokeVehicle(String vehicleId) {
        Vehicle vehicle = vehicleRepository.findByVehicleId(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phương tiện"));

        if (vehicle.getUser() == null) {
            throw new IllegalArgumentException("Phương tiện này chưa được cấp phát cho tài xế nào");
        }

        String previousDriver = vehicle.getUser().getEmployeeId();
        vehicle.setUser(null);
        vehicle = vehicleRepository.save(vehicle);

        log.info("Đã thu hồi phương tiện ID {} từ tài xế {}", vehicleId, previousDriver);
        return mapToResponse(vehicle);
    }

    /**
     * Upload ảnh xe
     */
    @Transactional
    public VehicleResponse uploadVehicleImage(String vehicleId, org.springframework.web.multipart.MultipartFile file) {
        Vehicle vehicle = vehicleRepository.findByVehicleId(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phương tiện"));

        // Xóa ảnh cũ nếu có
        if (vehicle.getImageUrl() != null && !vehicle.getImageUrl().isBlank()) {
            vehicleImageService.deleteVehicleImage(vehicle.getImageUrl());
        }

        // Upload ảnh mới
        String imageUrl = vehicleImageService.uploadVehicleImage(file, vehicleId);
        vehicle.setImageUrl(imageUrl);
        vehicle = vehicleRepository.save(vehicle);

        log.info("Đã upload ảnh cho phương tiện ID: {}", vehicleId);
        return mapToResponse(vehicle);
    }

    /**
     * Xóa ảnh xe
     */
    @Transactional
    public VehicleResponse deleteVehicleImage(String vehicleId) {
        Vehicle vehicle = vehicleRepository.findByVehicleId(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phương tiện"));

        if (vehicle.getImageUrl() != null && !vehicle.getImageUrl().isBlank()) {
            vehicleImageService.deleteVehicleImage(vehicle.getImageUrl());
            vehicle.setImageUrl(null);
            vehicle = vehicleRepository.save(vehicle);
            log.info("Đã xóa ảnh phương tiện ID: {}", vehicleId);
        }

        return mapToResponse(vehicle);
    }


    private VehicleResponse mapToResponse(Vehicle vehicle) {
        VehicleResponse.VehicleResponseBuilder builder = VehicleResponse.builder()
                .vehicleId(vehicle.getVehicleId())
                .vin(vehicle.getVin())
                .model(vehicle.getModel())
                .licensePlate(vehicle.getLicensePlate())
                .batteryType(vehicle.getBatteryType())
                .batteryCapacity(vehicle.getBatteryCapacity())
                .status(vehicle.getStatus())
                .imageUrl(vehicle.getImageUrl())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt());

        // Thêm thông tin chủ sở hữu nếu có
        if (vehicle.getUser() != null) {
            builder.employeeId(vehicle.getUser().getEmployeeId())
                   .driverName(vehicle.getUser().getFullName());
        }

        return builder.build();
    }
}
