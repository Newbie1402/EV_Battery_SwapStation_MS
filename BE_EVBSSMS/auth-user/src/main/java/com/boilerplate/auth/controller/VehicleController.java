package com.boilerplate.auth.controller;

import com.boilerplate.auth.model.request.AddVehicleRequest;
import com.boilerplate.auth.model.dto.request.UpdateVehicleRequest;
import com.boilerplate.auth.model.dto.response.VehicleResponse;
import com.boilerplate.auth.model.response.ResponseData;
import com.boilerplate.auth.security.CustomUserDetails;
import com.boilerplate.auth.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý API quản lý phương tiện (dành cho Driver)
 */
@RestController
@RequestMapping("/api/driver/vehicles")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Vehicle Management", description = "APIs quản lý phương tiện của tài xế")
@SecurityRequirement(name = "bearerAuth")
public class VehicleController {

    private final VehicleService vehicleService;

    /**
     * Thêm phương tiện mới
     */
    @PostMapping
    @Operation(summary = "Thêm phương tiện", description = "Thêm phương tiện mới cho tài xế")
    public ResponseEntity<ResponseData<VehicleResponse>> addVehicle(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AddVehicleRequest request) {

        log.info("Thêm phương tiện mới cho user ID: {}", userDetails.getUserId());
        VehicleResponse response = vehicleService.addVehicle(userDetails.getUserId(), request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ResponseData<>(201, "Thêm phương tiện thành công", response)
        );
    }

    /**
     * Lấy danh sách phương tiện
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách phương tiện", description = "Lấy tất cả phương tiện của tài xế")
    public ResponseEntity<ResponseData<List<VehicleResponse>>> getVehicles(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        log.info("Lấy danh sách phương tiện cho user ID: {}", userDetails.getUserId());
        List<VehicleResponse> response = vehicleService.getUserVehicles(userDetails.getUserId());

        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy danh sách phương tiện thành công", response)
        );
    }

    /**
     * Lấy thông tin chi tiết phương tiện
     */
    @GetMapping("/{vehicleId}")
    @Operation(summary = "Lấy thông tin phương tiện", description = "Lấy thông tin chi tiết một phương tiện")
    public ResponseEntity<ResponseData<VehicleResponse>> getVehicleById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long vehicleId) {

        log.info("Lấy thông tin phương tiện ID: {} cho user ID: {}", vehicleId, userDetails.getUserId());
        VehicleResponse response = vehicleService.getVehicleById(vehicleId, userDetails.getUserId());

        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy thông tin phương tiện thành công", response)
        );
    }

    /**
     * Cập nhật thông tin phương tiện
     */
    @PutMapping("/{vehicleId}")
    @Operation(summary = "Cập nhật phương tiện", description = "Cập nhật thông tin phương tiện")
    public ResponseEntity<ResponseData<VehicleResponse>> updateVehicle(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long vehicleId,
            @Valid @RequestBody UpdateVehicleRequest request) {

        log.info("Cập nhật phương tiện ID: {} cho user ID: {}", vehicleId, userDetails.getUserId());
        VehicleResponse response = vehicleService.updateVehicle(vehicleId, userDetails.getUserId(), request);

        return ResponseEntity.ok(
                new ResponseData<>(200, "Cập nhật phương tiện thành công", response)
        );
    }

    /**
     * Xóa phương tiện
     */
    @DeleteMapping("/{vehicleId}")
    @Operation(summary = "Xóa phương tiện", description = "Xóa phương tiện (chuyển trạng thái thành INACTIVE)")
    public ResponseEntity<ResponseData<String>> deleteVehicle(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long vehicleId) {

        log.info("Xóa phương tiện ID: {} cho user ID: {}", vehicleId, userDetails.getUserId());
        vehicleService.deleteVehicle(vehicleId, userDetails.getUserId());

        return ResponseEntity.ok(
                new ResponseData<>(200, "Xóa phương tiện thành công", null)
        );
    }
}
