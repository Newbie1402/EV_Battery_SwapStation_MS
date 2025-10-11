package com.boilerplate.auth.controller;

import com.boilerplate.auth.enums.Role;
import com.boilerplate.auth.model.dto.request.ApproveRegistrationRequest;
import com.boilerplate.auth.model.dto.request.UpdateStaffRequest;
import com.boilerplate.auth.model.dto.response.AuthResponse;
import com.boilerplate.auth.model.dto.response.UserResponse;
import com.boilerplate.auth.model.response.ResponseData;
import com.boilerplate.auth.service.AuthService;
import com.boilerplate.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller cho Admin quản lý đơn đăng ký
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin", description = "APIs quản trị hệ thống - chỉ dành cho Admin")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AuthService authService;
    private final UserService userService;

    /**
     * Lấy danh sách tất cả nhân viên
     */
    @GetMapping("/staff")
    @Operation(summary = "Lấy danh sách nhân viên", description = "Lấy danh sách tất cả nhân viên trạm")
    public ResponseEntity<ResponseData<List<UserResponse>>> getAllStaff() {
        log.info("Admin lấy danh sách tất cả nhân viên");
        List<UserResponse> response = userService.getAllStaff();

        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy danh sách nhân viên thành công", response)
        );
    }

    /**
     * Lấy danh sách tất cả tài xế
     */
    @GetMapping("/drivers")
    @Operation(summary = "Lấy danh sách tài xế", description = "Lấy danh sách tất cả tài xế")
    public ResponseEntity<ResponseData<List<UserResponse>>> getAllDrivers() {
        log.info("Admin lấy danh sách tất cả tài xế");
        List<UserResponse> response = userService.getAllDrivers();

        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy danh sách tài xế thành công", response)
        );
    }

    /**
     * Lấy thông tin user theo ID
     */
    @GetMapping("/users/{userId}")
    @Operation(summary = "Lấy thông tin user", description = "Lấy thông tin chi tiết một user")
    public ResponseEntity<ResponseData<UserResponse>> getUserById(@PathVariable Long userId) {
        log.info("Admin lấy thông tin user ID: {}", userId);
        UserResponse response = userService.getUserById(userId);

        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy thông tin user thành công", response)
        );
    }

    /**
     * Cập nhật thông tin nhân viên
     */
    @PutMapping("/staff/{staffId}")
    @Operation(summary = "Cập nhật thông tin nhân viên", description = "Cập nhật thông tin nhân viên, bao gồm gán trạm")
    public ResponseEntity<ResponseData<UserResponse>> updateStaff(
            @PathVariable Long staffId,
            @Valid @RequestBody UpdateStaffRequest request) {
        log.info("Admin cập nhật thông tin staff ID: {}", staffId);
        UserResponse response = userService.updateStaff(staffId, request);

        return ResponseEntity.ok(
                new ResponseData<>(200, "Cập nhật thông tin nhân viên thành công", response)
        );
    }

    /**
     * Kích hoạt tài khoản
     */
    @PutMapping("/users/{userId}/activate")
    @Operation(summary = "Kích hoạt tài khoản", description = "Kích hoạt tài khoản người dùng")
    public ResponseEntity<ResponseData<String>> activateUser(@PathVariable Long userId) {
        log.info("Admin kích hoạt tài khoản user ID: {}", userId);
        userService.toggleUserActiveStatus(userId, true);

        return ResponseEntity.ok(
                new ResponseData<>(200, "Kích hoạt tài khoản thành công", null)
        );
    }

    /**
     * Vô hiệu hóa tài khoản
     */
    @PutMapping("/users/{userId}/deactivate")
    @Operation(summary = "Vô hiệu hóa tài khoản", description = "Vô hiệu hóa tài khoản người dùng")
    public ResponseEntity<ResponseData<String>> deactivateUser(@PathVariable Long userId) {
        log.info("Admin vô hiệu hóa tài khoản user ID: {}", userId);
        userService.toggleUserActiveStatus(userId, false);

        return ResponseEntity.ok(
                new ResponseData<>(200, "Vô hiệu hóa tài khoản thành công", null)
        );
    }

    /**
     * Gán nhân viên vào trạm
     */
    @PutMapping("/staff/{staffId}/assign-station/{stationId}")
    @Operation(summary = "Gán nhân viên vào trạm", description = "Gán nhân viên vào một trạm cụ thể")
    public ResponseEntity<ResponseData<UserResponse>> assignStaffToStation(
            @PathVariable Long staffId,
            @PathVariable Long stationId) {
        log.info("Admin gán staff ID {} vào trạm ID {}", staffId, stationId);
        UserResponse response = userService.assignStaffToStation(staffId, stationId);

        return ResponseEntity.ok(
                new ResponseData<>(200, "Gán nhân viên vào trạm thành công", response)
        );
    }

    /**
     * Lấy danh sách nhân viên theo trạm
     */
    @GetMapping("/stations/{stationId}/staff")
    @Operation(summary = "Lấy nhân viên theo trạm", description = "Lấy danh sách nhân viên được gán vào một trạm")
    public ResponseEntity<ResponseData<List<UserResponse>>> getStaffByStation(@PathVariable Long stationId) {
        log.info("Admin lấy danh sách nhân viên của trạm ID: {}", stationId);
        List<UserResponse> response = userService.getStaffByStation(stationId);

        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy danh sách nhân viên thành công", response)
        );
    }

    /**
     * Lấy danh sách đơn đăng ký chờ duyệt
     */
    @GetMapping("/registrations/pending")
    @Operation(summary = "Lấy danh sách đơn đăng ký chờ duyệt",
               description = "Lấy tất cả đơn đăng ký đang chờ admin phê duyệt. Có thể lọc theo role (DRIVER/STAFF)")
    public ResponseEntity<ResponseData<List<UserResponse>>> getPendingRegistrations(
            @RequestParam(required = false) Role role) {
        log.info("Admin yêu cầu danh sách đơn đăng ký chờ duyệt, role filter: {}", role);

        List<UserResponse> pendingUsers = authService.getPendingRegistrations(role);

        return ResponseEntity.ok(
                ResponseData.<List<UserResponse>>builder()
                        .statusCode(200)
                        .message("Lấy danh sách thành công")
                        .data(pendingUsers)
                        .build()
        );
    }

    /**
     * Đếm số lượng đơn đăng ký chờ duyệt
     */
    @GetMapping("/registrations/pending/count")
    @Operation(summary = "Đếm số đơn chờ duyệt",
               description = "Đếm tổng số đơn đăng ký đang chờ phê duyệt")
    public ResponseEntity<ResponseData<Map<String, Long>>> countPendingRegistrations() {
        log.info("Admin yêu cầu đếm số đơn chờ duyệt");

        long count = authService.countPendingRegistrations();
        Map<String, Long> result = new HashMap<>();
        result.put("count", count);

        return ResponseEntity.ok(
                ResponseData.<Map<String, Long>>builder()
                        .statusCode(200)
                        .message("Đếm thành công")
                        .data(result)
                        .build()
        );
    }

    /**
     * Phê duyệt hoặc từ chối đơn đăng ký
     */
    @PostMapping("/registrations/approve")
    @Operation(summary = "Phê duyệt/Từ chối đơn đăng ký",
               description = "Admin phê duyệt (approve=true) hoặc từ chối (approve=false) đơn đăng ký. " +
                           "Nếu approve, hệ thống sẽ gửi OTP cho user. Nếu reject, phải cung cấp lý do.")
    public ResponseEntity<ResponseData<AuthResponse>> approveRegistration(
            @Valid @RequestBody ApproveRegistrationRequest request) {
        log.info("Admin {} đơn đăng ký userId: {}",
                request.getApproved() ? "phê duyệt" : "từ chối",
                request.getUserId());

        AuthResponse response = authService.approveRegistration(request);

        return ResponseEntity.ok(
                ResponseData.<AuthResponse>builder()
                        .statusCode(response.getStatusCode())
                        .message(response.getMessage())
                        .data(response)
                        .build()
        );
    }
}
