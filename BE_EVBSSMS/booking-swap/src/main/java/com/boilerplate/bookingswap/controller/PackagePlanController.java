package com.boilerplate.bookingswap.controller;

import com.boilerplate.bookingswap.enums.PackageType;
import com.boilerplate.bookingswap.model.dto.request.PackagePlanRequest;
import com.boilerplate.bookingswap.model.dto.request.PackagePlanUpdateRequest;
import com.boilerplate.bookingswap.model.dto.respone.PackagePlanResponse;
import com.boilerplate.bookingswap.model.response.ResponseData;
import com.boilerplate.bookingswap.service.PackagePlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các API liên quan đến PackagePlan
 */
@RestController
@RequestMapping("/api/package-plans")
@RequiredArgsConstructor
@Slf4j
public class PackagePlanController {

    private final PackagePlanService packagePlanService;

    /**
     * Tạo gói thuê pin mới
     */
    @PostMapping
    public ResponseEntity<ResponseData<PackagePlanResponse>> createPackagePlan(
            @Valid @RequestBody PackagePlanRequest requestDTO) {
        log.info("REST request to create package plan: {}", requestDTO.getName());

        PackagePlanResponse response = packagePlanService.createPackagePlan(requestDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ResponseData.<PackagePlanResponse>builder()
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Tạo gói thuê pin thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy thông tin gói thuê pin theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResponseData<PackagePlanResponse>> getPackagePlanById(@PathVariable Long id) {
        log.info("REST request to get package plan: {}", id);

        PackagePlanResponse response = packagePlanService.getPackagePlanById(id);

        return ResponseEntity.ok(
                ResponseData.<PackagePlanResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy thông tin gói thuê pin thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy tất cả gói thuê pin
     */
    @GetMapping
    public ResponseEntity<ResponseData<Page<PackagePlanResponse>>> getAllPackagePlans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get all package plans");

        Page<PackagePlanResponse> response = packagePlanService.getAllPackagePlans(page, size);

        return ResponseEntity.ok(
                ResponseData.<Page<PackagePlanResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách gói thuê pin thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy gói thuê pin theo loại
     */
    @GetMapping("/type/{packageType}")
    public ResponseEntity<ResponseData<List<PackagePlanResponse>>> getPackagePlansByType(
            @PathVariable PackageType packageType) {
        log.info("REST request to get package plans by type: {}", packageType);

        List<PackagePlanResponse> response = packagePlanService.getPackagePlansByType(packageType);

        return ResponseEntity.ok(
                ResponseData.<List<PackagePlanResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách gói thuê pin thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy gói thuê pin phổ biến nhất
     */
    @GetMapping("/popular")
    public ResponseEntity<ResponseData<List<PackagePlanResponse>>> getMostPopularPackages(
            @RequestParam(defaultValue = "5") int limit) {
        log.info("REST request to get most popular package plans");

        List<PackagePlanResponse> response = packagePlanService.getMostPopularPackages(limit);

        return ResponseEntity.ok(
                ResponseData.<List<PackagePlanResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy gói thuê pin phổ biến thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy gói thuê pin có giá trị tốt nhất
     */
    @GetMapping("/best-value/{packageType}")
    public ResponseEntity<ResponseData<List<PackagePlanResponse>>> getBestValuePackages(
            @PathVariable PackageType packageType) {
        log.info("REST request to get best value package plans for type: {}", packageType);

        List<PackagePlanResponse> response = packagePlanService.getBestValuePackages(packageType);

        return ResponseEntity.ok(
                ResponseData.<List<PackagePlanResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy gói thuê pin giá trị tốt nhất thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Cập nhật gói thuê pin
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ResponseData<PackagePlanResponse>> updatePackagePlan(
            @PathVariable Long id,
            @Valid @RequestBody PackagePlanUpdateRequest updateDTO) {
        log.info("REST request to update package plan: {}", id);

        PackagePlanResponse response = packagePlanService.updatePackagePlan(id, updateDTO);

        return ResponseEntity.ok(
                ResponseData.<PackagePlanResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Cập nhật gói thuê pin thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Xóa gói thuê pin
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseData<String>> deletePackagePlan(@PathVariable Long id) {
        log.info("REST request to delete package plan: {}", id);

        packagePlanService.deletePackagePlan(id);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Xóa gói thuê pin thành công")
                        .data("Đã xóa gói thuê pin ID: " + id)
                        .build()
        );
    }

    /**
     * Kích hoạt lại gói thuê pin đã bị INACTIVE
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<ResponseData<PackagePlanResponse>> activatePackagePlan(@PathVariable Long id) {
        log.info("REST request to activate package plan: {}", id);

        PackagePlanResponse response = packagePlanService.activatePackagePlan(id);

        return ResponseEntity.ok(
                ResponseData.<PackagePlanResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Kích hoạt lại gói thuê pin thành công")
                        .data(response)
                        .build()
        );
    }
}