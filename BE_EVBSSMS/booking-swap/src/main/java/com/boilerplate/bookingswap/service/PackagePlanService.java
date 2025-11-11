package com.boilerplate.bookingswap.service;

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
     * Lấy gói thuê pin theo loại
     */
    public List<PackagePlanResponse> getPackagePlansByType(PackageType packageType) {
        log.debug("Lấy danh sách gói thuê pin theo loại: {}", packageType);

        List<PackagePlan> packagePlans = packagePlanRepository.findByPackageType(packageType);

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
     * Xóa gói thuê pin
     */
    @Transactional
    public void deletePackagePlan(Long id) {
        log.info("Xóa gói thuê pin ID: {}", id);

        PackagePlan packagePlan = packagePlanRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy gói thuê pin với ID: " + id));

        // Kiểm tra có người đang sử dụng gói này không
        Long activeSubscriptions = packagePlanRepository.countByPackageType(packagePlan.getPackageType());
        if (activeSubscriptions > 0) {
            throw new IllegalStateException("Không thể xóa gói thuê pin đang có người sử dụng");
        }

        packagePlanRepository.deleteById(id);

        log.info("Đã xóa gói thuê pin ID: {}", id);
    }
}