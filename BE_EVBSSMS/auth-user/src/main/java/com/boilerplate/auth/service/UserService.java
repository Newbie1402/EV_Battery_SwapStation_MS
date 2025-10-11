package com.boilerplate.auth.service;

import com.boilerplate.auth.enums.Role;
import com.boilerplate.auth.enums.UserStatus;
import com.boilerplate.auth.exception.ResourceNotFoundException;
import com.boilerplate.auth.model.dto.request.UpdateStaffRequest;
import com.boilerplate.auth.model.dto.request.UpdateProfileRequest;
import com.boilerplate.auth.model.dto.response.UserResponse;
import com.boilerplate.auth.model.dto.response.VehicleResponse;
import com.boilerplate.auth.model.entity.User;
import com.boilerplate.auth.repository.UserRepository;
import com.boilerplate.auth.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý quản lý người dùng (dành cho Admin)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    /**
     * Lấy danh sách tất cả nhân viên trạm
     */
    public List<UserResponse> getAllStaff() {
        List<User> staffList = userRepository.findByRole(Role.STAFF);
        return staffList.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách tất cả tài xế
     */
    public List<UserResponse> getAllDrivers() {
        List<User> driverList = userRepository.findByRole(Role.DRIVER);
        return driverList.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thông tin user theo ID
     */
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        return mapToUserResponse(user);
    }

    /**
     * Lấy thông tin profile của user hiện tại
     */
    public UserResponse getCurrentUserProfile(Long userId) {
        return getUserById(userId);
    }

    /**
     * Cập nhật profile của user hiện tại
     */
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        // Cập nhật thông tin (chỉ các trường được phép)
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getBirthday() != null) {
            user.setBirthday(request.getBirthday());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        user = userRepository.save(user);
        log.info("Đã cập nhật profile cho user ID: {}", userId);

        return mapToUserResponse(user);
    }

    /**
     * Cập nhật thông tin nhân viên
     */
    @Transactional
    public UserResponse updateStaff(Long staffId, UpdateStaffRequest request) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với ID: " + staffId));

        if (staff.getRole() != Role.STAFF) {
            throw new IllegalArgumentException("User này không phải là nhân viên trạm");
        }

        // Cập nhật thông tin
        if (request.getPhone() != null) {
            staff.setPhone(request.getPhone());
        }
        if (request.getFullName() != null) {
            staff.setFullName(request.getFullName());
        }
        if (request.getBirthday() != null) {
            staff.setBirthday(request.getBirthday());
        }
        if (request.getAddress() != null) {
            staff.setAddress(request.getAddress());
        }

        staff = userRepository.save(staff);
        log.info("Đã cập nhật thông tin nhân viên ID: {}", staffId);

        return mapToUserResponse(staff);
    }

    /**
     * Kích hoạt/Vô hiệu hóa tài khoản
     */
    @Transactional
    public void toggleUserActiveStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        user.setStatus(active ? UserStatus.ACTIVE : UserStatus.INACTIVE);
        userRepository.save(user);

        log.info("Đã {} tài khoản user ID: {}", active ? "kích hoạt" : "vô hiệu hóa", userId);
    }

    /**
     * Gán nhân viên vào trạm
     * Note: Cần thêm trường assignedStationId vào User entity nếu chưa có
     */
    @Transactional
    public UserResponse assignStaffToStation(Long staffId, Long stationId) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với ID: " + staffId));

        if (staff.getRole() != Role.STAFF) {
            throw new IllegalArgumentException("User này không phải là nhân viên trạm");
        }

        // TODO: Kiểm tra stationId có tồn tại không (cần gọi station-service)
        // Tạm thời lưu vào notes hoặc cần thêm trường assignedStationId vào User entity

        staff = userRepository.save(staff);
        log.info("Đã gán nhân viên ID: {} vào trạm ID: {}", staffId, stationId);

        return mapToUserResponse(staff);
    }

    /**
     * Lấy danh sách nhân viên theo trạm
     * Note: Cần thêm trường assignedStationId vào User entity
     */
    public List<UserResponse> getStaffByStation(Long stationId) {
        // TODO: Cần thêm query method findByRoleAndAssignedStationId trong UserRepository
        // Tạm thời trả về danh sách rỗng
        log.warn("Chức năng getStaffByStation chưa được triển khai đầy đủ. Cần thêm trường assignedStationId vào User entity");
        return List.of();
    }


    private UserResponse mapToUserResponse(User user) {
        // Lấy danh sách vehicles của user nếu có
        List<VehicleResponse> vehicles = null;
        if (user.getRole() == Role.DRIVER) {
            vehicles = vehicleRepository.findByUserId(user.getId())
                    .stream()
                    .map(this::mapToVehicleResponse)
                    .collect(Collectors.toList());
        }

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .birthday(user.getBirthday())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .address(user.getAddress())
                .identityCard(user.getIdentityCard())
                .status(user.getStatus())
                .vehicles(vehicles)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }


    private VehicleResponse mapToVehicleResponse(com.boilerplate.auth.model.entity.Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .vin(vehicle.getVin())
                .model(vehicle.getModel())
                .licensePlate(vehicle.getLicensePlate())
                .batteryType(vehicle.getBatteryType())
                .batteryCapacity(vehicle.getBatteryCapacity())
                .status(vehicle.getStatus())
                .notes(vehicle.getNotes())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}

