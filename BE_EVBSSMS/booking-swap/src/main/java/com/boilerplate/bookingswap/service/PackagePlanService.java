package com.boilerplate.bookingswap.service;

import com.boilerplate.bookingswap.enums.PackageStatus;
import com.boilerplate.bookingswap.enums.PackageType;
import com.boilerplate.bookingswap.exception.NotFoundException;
import com.boilerplate.bookingswap.model.entity.PackagePlan;
import com.boilerplate.bookingswap.model.dto.request.PackagePlanRequest;
import com.boilerplate.bookingswap.model.dto.request.PackagePlanUpdateRequest;
import com.boilerplate.bookingswap.model.dto.respone.PackagePlanResponse;
import com.boilerplate.bookingswap.repository.PackagePlanRepository;
import com.boilerplate.bookingswap.service.mapper.PackagePlanMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý business logic cho PackagePlan
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PackagePlanService {

    private final PackagePlanRepository packagePlanRepository;
    private final PackagePlanMapper packagePlanMapper;

    /**
     * Tạo gói thuê pin mới
     */
    @Transactional
    public PackagePlanResponse createPackagePlan(PackagePlanRequest requestDTO) {
        log.info("Tạo gói thuê pin mới: {}", requestDTO.getName());

        // Kiểm tra tên gói đã tồn tại chưa
        if (packagePlanRepository.existsByName(requestDTO.getName())) {
            throw new IllegalStateException("Tên gói đã tồn tại: " + requestDTO.getName());
        }

        PackagePlan packagePlan = packagePlanMapper.toEntity(requestDTO);
        PackagePlan savedPackagePlan = packagePlanRepository.save(packagePlan);

        log.info("Đã tạo gói thuê pin ID: {} - Tên: {}",
                savedPackagePlan.getId(), savedPackagePlan.getName());

        return packagePlanMapper.toResponseDTO(savedPackagePlan);
    }

    /**
     * Lấy thông tin gói thuê pin theo ID
     */
    public PackagePlanResponse getPackagePlanById(Long id) {
        log.debug("Lấy thông tin gói thuê pin ID: {}", id);

        PackagePlan packagePlan = packagePlanRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy gói thuê pin với ID: " + id));

        return packagePlanMapper.toResponseDTO(packagePlan);
    }

    /**
     * Lấy tất cả gói thuê pin
     */
    public Page<PackagePlanResponse> getAllPackagePlans(int page, int size) {
        log.debug("Lấy danh sách tất cả gói thuê pin");

        Pageable pageable = PageRequest.of(page, size);
        Page<PackagePlan> packagePlans = packagePlanRepository.findAll(pageable);

        return packagePlans.map(packagePlanMapper::toResponseDTO);
    }

    /**
     * Lấy gói thuê pin theo loại (chỉ ACTIVE)
     */
    public List<PackagePlanResponse> getPackagePlansByType(PackageType packageType) {
        log.debug("Lấy danh sách gói thuê pin ACTIVE theo loại: {}", packageType);

        List<PackagePlan> packagePlans = packagePlanRepository.findByPackageTypeAndStatus(packageType, PackageStatus.ACTIVE);

        return packagePlans.stream()
                .map(packagePlanMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy gói thuê pin phổ biến nhất
     */
    public List<PackagePlanResponse> getMostPopularPackages(int limit) {
        log.debug("Lấy {} gói thuê pin phổ biến nhất", limit);

        List<PackagePlan> popularPackages = packagePlanRepository.findMostPopularPackages(limit);

        return popularPackages.stream()
                .map(packagePlanMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy gói thuê pin có giá trị tốt nhất
     */
    public List<PackagePlanResponse> getBestValuePackages(PackageType packageType) {
        log.debug("Lấy gói thuê pin có giá trị tốt nhất cho loại: {}", packageType);

        List<PackagePlan> bestValuePackages = packagePlanRepository.findBestValuePackages(packageType);

        return bestValuePackages.stream()
                .map(packagePlanMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật gói thuê pin
     */
    @Transactional
    public PackagePlanResponse updatePackagePlan(Long id, PackagePlanUpdateRequest updateDTO) {
        log.info("Cập nhật gói thuê pin ID: {}", id);

        PackagePlan packagePlan = packagePlanRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy gói thuê pin với ID: " + id));

        // Kiểm tra tên mới có trùng không (nếu đổi tên)
        if (updateDTO.getName() != null && !updateDTO.getName().equals(packagePlan.getName())) {
            if (packagePlanRepository.existsByName(updateDTO.getName())) {
                throw new IllegalStateException("Tên gói đã tồn tại: " + updateDTO.getName());
            }
        }

        packagePlanMapper.updateEntityFromDTO(packagePlan, updateDTO);
        PackagePlan updatedPackagePlan = packagePlanRepository.save(packagePlan);

        log.info("Đã cập nhật gói thuê pin ID: {}", id);

        return packagePlanMapper.toResponseDTO(updatedPackagePlan);
    }

    /**
     * Xóa gói thuê pin (soft delete - set status về INACTIVE)
     */
    @Transactional
    public void deletePackagePlan(Long id) {
        log.info("Xóa gói thuê pin ID: {}", id);

        PackagePlan packagePlan = packagePlanRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy gói thuê pin với ID: " + id));

        // Set status về INACTIVE thay vì xóa thật
        packagePlan.setStatus(PackageStatus.INACTIVE);
        packagePlanRepository.save(packagePlan);

        log.info("Đã đánh dấu gói thuê pin ID: {} là INACTIVE", id);
    }

    /**
     * Kích hoạt lại gói thuê pin đã bị INACTIVE
     */
    @Transactional
    public PackagePlanResponse activatePackagePlan(Long id) {
        log.info("Kích hoạt lại gói thuê pin ID: {}", id);

        PackagePlan packagePlan = packagePlanRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy gói thuê pin với ID: " + id));

        // Kiểm tra gói đã INACTIVE chưa
        if (packagePlan.getStatus() == PackageStatus.ACTIVE) {
            throw new IllegalStateException("Gói thuê pin đã ở trạng thái ACTIVE");
        }

        // Kiểm tra tên gói có bị trùng với gói ACTIVE khác không
        if (packagePlanRepository.existsByName(packagePlan.getName())) {
            throw new IllegalStateException("Tên gói đã tồn tại trong các gói ACTIVE: " + packagePlan.getName());
        }

        // Set status về ACTIVE
        packagePlan.setStatus(PackageStatus.ACTIVE);
        PackagePlan activatedPackagePlan = packagePlanRepository.save(packagePlan);

        log.info("Đã kích hoạt lại gói thuê pin ID: {} - Tên: {}", id, packagePlan.getName());

        return packagePlanMapper.toResponseDTO(activatedPackagePlan);
    }
}