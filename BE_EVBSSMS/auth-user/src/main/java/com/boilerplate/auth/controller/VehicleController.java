package com.boilerplate.auth.controller;

import com.boilerplate.auth.entity.User;
import com.boilerplate.auth.exception.ResourceNotFoundException;
import com.boilerplate.auth.model.dto.response.VehicleResponse;
import com.boilerplate.auth.model.response.ResponseData;
import com.boilerplate.auth.repository.UserRepository;
import com.boilerplate.auth.security.CustomUserDetails;
import com.boilerplate.auth.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý API quản lý phương tiện (dành cho Driver)
 * Tài xế chỉ có thể xem danh sách phương tiện được cấp phát cho mình
 */
@RestController
@RequestMapping("/api/driver/vehicles")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Vehicle Management", description = "APIs quản lý phương tiện của tài xế")
@SecurityRequirement(name = "bearerAuth")
public class VehicleController {

    private final VehicleService vehicleService;
    private final UserRepository userRepository;

    /**
     * Lấy danh sách phương tiện được cấp phát
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách phương tiện",
               description = "Lấy tất cả phương tiện được cấp phát cho tài xế")
    public ResponseEntity<ResponseData<List<VehicleResponse>>> getMyVehicles(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        // Query user từ DB để lấy employeeId mới nhất (không dùng từ token vì có thể cũ)
        User user = userRepository.findById(userDetails.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        log.info("Tài xế employeeId={} (userId={}) lấy danh sách phương tiện",
            user.getEmployeeId(), user.getId());

        List<VehicleResponse> response = vehicleService.getUserVehicles(user.getEmployeeId());

        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy danh sách phương tiện thành công", response)
        );
    }

    /**
     * Lấy thông tin chi tiết phương tiện
     */
    @GetMapping("/{vehicleId}")
    @Operation(summary = "Lấy thông tin phương tiện",
               description = "Lấy thông tin chi tiết một phương tiện")
    public ResponseEntity<ResponseData<VehicleResponse>> getVehicleById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String vehicleId) {

        // Query user từ DB để lấy employeeId mới nhất (không dùng từ token vì có thể cũ)
        User user = userRepository.findById(userDetails.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        log.info("=== DEBUG INFO ===");
        log.info("User đang đăng nhập: userId={}, email={}, role={}",
            user.getId(), user.getEmail(), user.getRole());
        log.info("EmployeeId trong DB: {}", user.getEmployeeId());
        log.info("VehicleId đang tìm: {}", vehicleId);
        log.info("==================");

        VehicleResponse response = vehicleService.getVehicleById(vehicleId, user.getEmployeeId());

        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy thông tin phương tiện thành công", response)
        );
    }
}
