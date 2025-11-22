package com.boilerplate.auth.service;

import com.boilerplate.auth.entity.Vehicle;
import com.boilerplate.auth.enums.Role;
import com.boilerplate.auth.enums.UserStatus;
import com.boilerplate.auth.exception.ResourceNotFoundException;
import com.boilerplate.auth.model.dto.request.UpdateStaffRequest;
import com.boilerplate.auth.model.dto.request.UpdateProfileRequest;
import com.boilerplate.auth.model.dto.response.UserResponse;
import com.boilerplate.auth.model.dto.response.VehicleResponse;
import com.boilerplate.auth.entity.User;
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
     * Lấy thông tin staff theo employeeId
     */
    public UserResponse getStaffByEmployeeId(String employeeId) {
        User staff = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với mã: " + employeeId));

        if (staff.getRole() != Role.STAFF) {
            throw new IllegalArgumentException("User này không phải là nhân viên trạm");
        }

        return mapToUserResponse(staff);
    }

    /**
     * Lấy thông tin driver theo employeeId
     */
    public UserResponse getDriverByEmployeeId(String employeeId) {
        User driver = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài xế với mã: " + employeeId));

        if (driver.getRole() != Role.DRIVER) {
            throw new IllegalArgumentException("User này không phải là tài xế");
        }

        return mapToUserResponse(driver);
    }

    /**
     * Lấy thông tin profile của user hiện tại
     */
    public UserResponse getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        return mapToUserResponse(user);
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
     * Cập nhật thông tin nhân viên theo employeeId
     */
    @Transactional
    public UserResponse updateStaffByEmployeeId(String employeeId, UpdateStaffRequest request) {
        User staff = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với mã: " + employeeId));

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
        log.info("Đã cập nhật thông tin nhân viên employeeId: {}", employeeId);

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


    private UserResponse mapToUserResponse(User user) {
        // Lấy danh sách vehicles của user nếu có
        List<VehicleResponse> vehicles = null;
        if (user.getRole() == Role.DRIVER && user.getEmployeeId() != null) {
            vehicles = vehicleRepository.findByUserEmployeeId(user.getEmployeeId())
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
                .isVerified(user.getIsVerified())
                .isActive(user.getIsActive())
                .status(user.getStatus())
                .vehicles(vehicles)
                .employeeId(user.getEmployeeId())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }


    private VehicleResponse mapToVehicleResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .vehicleId(vehicle.getVehicleId())
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
