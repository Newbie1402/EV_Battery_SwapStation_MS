package com.boilerplate.auth.controller;

import com.boilerplate.auth.model.dto.request.UpdateVehicleRequest;
import com.boilerplate.auth.model.dto.response.VehicleResponse;
import com.boilerplate.auth.model.request.AddVehicleRequest;
import com.boilerplate.auth.model.response.ResponseData;
import com.boilerplate.auth.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý API quản lý phương tiện dành cho Admin
 */
@RestController
@RequestMapping("/api/admin/vehicles")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Vehicle Management", description = "APIs quản lý phương tiện dành cho Admin")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminVehicleController {

    private final VehicleService vehicleService;

    /**
     * Thêm phương tiện mới vào hệ thống
     */
    @PostMapping
    @Operation(summary = "Thêm phương tiện mới",
               description = "Admin thêm phương tiện mới vào hệ thống (chưa cấp phát cho tài xế)")
    public ResponseEntity<ResponseData<VehicleResponse>> addVehicle(
            @Valid @RequestBody AddVehicleRequest request) {

        log.info("Admin thêm phương tiện mới: VIN {}", request.getVin());
        VehicleResponse response = vehicleService.addVehicle(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ResponseData<>(201, "Thêm phương tiện thành công", response)
        );
    }

    /**
     * Lấy tất cả phương tiện trong hệ thống
     */
    @GetMapping
    @Operation(summary = "Lấy tất cả phương tiện",
               description = "Lấy danh sách tất cả phương tiện trong hệ thống")
    public ResponseEntity<ResponseData<List<VehicleResponse>>> getAllVehicles() {

        log.info("Admin lấy danh sách tất cả phương tiện");
        List<VehicleResponse> response = vehicleService.getAllVehicles();

        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy danh sách phương tiện thành công", response)
        );
    }

    /**
     * Lấy danh sách phương tiện chưa được cấp phát
     */
    @GetMapping("/unassigned")
    @Operation(summary = "Lấy phương tiện chưa cấp phát",
               description = "Lấy danh sách phương tiện chưa được cấp phát cho tài xế nào")
    public ResponseEntity<ResponseData<List<VehicleResponse>>> getUnassignedVehicles() {

        log.info("Admin lấy danh sách phương tiện chưa cấp phát");
        List<VehicleResponse> response = vehicleService.getUnassignedVehicles();

        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy danh sách phương tiện chưa cấp phát thành công", response)
        );
    }

    /**
     * Lấy chi tiết phương tiện theo vehicleId
     */
    @GetMapping("/{vehicleId}")
    @Operation(summary = "Lấy chi tiết phương tiện",
               description = "Lấy thông tin chi tiết một phương tiện theo vehicleId")
    public ResponseEntity<ResponseData<VehicleResponse>> getVehicleById(
            @PathVariable String vehicleId) {

        log.info("Admin lấy chi tiết phương tiện ID: {}", vehicleId);
        VehicleResponse response = vehicleService.getVehicleByVehicleId(vehicleId);

        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy thông tin phương tiện thành công", response)
        );
    }

    /**
     * Cập nhật thông tin phương tiện và cấp phát cho tài xế
     */
    @PutMapping("/{vehicleId}")
    @Operation(summary = "Cập nhật và cấp phát phương tiện",
               description = "Cập nhật thông tin phương tiện và cấp phát cho tài xế bằng employeeId")
    public ResponseEntity<ResponseData<VehicleResponse>> updateVehicle(
            @PathVariable String vehicleId,
            @Valid @RequestBody UpdateVehicleRequest request) {

        log.info("Admin cập nhật phương tiện ID: {}", vehicleId);
        if (request.getEmployeeId() != null) {
            log.info("Cấp phát phương tiện {} cho tài xế {}", vehicleId, request.getEmployeeId());
        }
        VehicleResponse response = vehicleService.updateVehicle(vehicleId, request);

        return ResponseEntity.ok(
                new ResponseData<>(200, "Cập nhật phương tiện thành công", response)
        );
    }

    /**
     * Thu hồi phương tiện từ tài xế
     */
    @PostMapping("/{vehicleId}/revoke")
    @Operation(summary = "Thu hồi phương tiện",
               description = "Thu hồi phương tiện từ tài xế (bỏ gán)")
    public ResponseEntity<ResponseData<VehicleResponse>> revokeVehicle(
            @PathVariable String vehicleId) {

        log.info("Admin thu hồi phương tiện ID: {}", vehicleId);
        VehicleResponse response = vehicleService.revokeVehicle(vehicleId);

        return ResponseEntity.ok(
                new ResponseData<>(200, "Thu hồi phương tiện thành công", response)
        );
    }

    /**
     * Xóa phương tiện
     */
    @DeleteMapping("/{vehicleId}")
    @Operation(summary = "Xóa phương tiện",
               description = "Xóa phương tiện khỏi hệ thống (soft delete)")
    public ResponseEntity<ResponseData<String>> deleteVehicle(
            @PathVariable String vehicleId) {

        log.info("Admin xóa phương tiện ID: {}", vehicleId);
        vehicleService.deleteVehicle(vehicleId);

        return ResponseEntity.ok(
                new ResponseData<>(200, "Xóa phương tiện thành công", null)
        );
    }

    /**
     * Upload ảnh xe
     */
    @PostMapping("/{vehicleId}/image")
    @Operation(summary = "Upload ảnh xe",
               description = "Upload ảnh xe lên AWS S3")
    public ResponseEntity<ResponseData<VehicleResponse>> uploadVehicleImage(
            @PathVariable String vehicleId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {

        log.info("Admin upload ảnh cho phương tiện ID: {}", vehicleId);
        VehicleResponse response = vehicleService.uploadVehicleImage(vehicleId, file);

        return ResponseEntity.ok(
                new ResponseData<>(200, "Upload ảnh xe thành công", response)
        );
    }

    /**
     * Xóa ảnh xe
     */
    @DeleteMapping("/{vehicleId}/image")
    @Operation(summary = "Xóa ảnh xe",
               description = "Xóa ảnh xe khỏi AWS S3")
    public ResponseEntity<ResponseData<VehicleResponse>> deleteVehicleImage(
            @PathVariable String vehicleId) {

        log.info("Admin xóa ảnh phương tiện ID: {}", vehicleId);
        VehicleResponse response = vehicleService.deleteVehicleImage(vehicleId);

        return ResponseEntity.ok(
                new ResponseData<>(200, "Xóa ảnh xe thành công", response)
        );
    }
}
