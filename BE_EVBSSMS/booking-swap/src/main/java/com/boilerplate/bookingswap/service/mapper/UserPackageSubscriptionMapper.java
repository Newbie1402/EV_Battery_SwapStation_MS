package com.boilerplate.bookingswap.service.mapper;

import com.boilerplate.bookingswap.enums.SubscriptionStatus;
import com.boilerplate.bookingswap.model.entity.PackagePlan;
import com.boilerplate.bookingswap.model.entity.UserPackageSubscription;
import com.boilerplate.bookingswap.model.dto.request.UserPackageSubscriptionRequest;
import com.boilerplate.bookingswap.model.dto.respone.UserPackageSubscriptionResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Mapper chuyển đổi giữa UserPackageSubscription Entity và DTOs
 */
@Component
public class UserPackageSubscriptionMapper {

    /**
     * Chuyển đổi từ Request DTO sang Entity
     * @param dto Request DTO
     * @param packagePlan PackagePlan entity
     * @return UserPackageSubscription entity
     */
    public UserPackageSubscription toEntity(UserPackageSubscriptionRequest dto, PackagePlan packagePlan) {
        if (dto == null || packagePlan == null) {
            return null;
        }

        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = calculateEndDate(startDate, packagePlan);

        return UserPackageSubscription.builder()
                .userId(dto.getUserId())
                .packagePlan(packagePlan)
                .startDate(startDate)
                .endDate(endDate)
                .usedSwaps(0)
                .status(SubscriptionStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Chuyển đổi từ Entity sang Response DTO
     * @param entity UserPackageSubscription entity
     * @return Response DTO
     */
    public UserPackageSubscriptionResponse toResponseDTO(UserPackageSubscription entity) {
        if (entity == null) {
            return null;
        }

        return UserPackageSubscriptionResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .packagePlanId(entity.getPackagePlan().getId())
                .packagePlanName(entity.getPackagePlan().getName())
                .packageMaxSwapPerMonth(entity.getPackagePlan().getMaxSwapPerMonth())
                .packagePlanType(entity.getPackagePlan().getPackageType())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .usedSwaps(entity.getUsedSwaps())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Tính ngày kết thúc dựa trên loại gói
     * @param startDate Ngày bắt đầu
     * @param packagePlan Gói thuê
     * @return Ngày kết thúc
     */
    private LocalDateTime calculateEndDate(LocalDateTime startDate, PackagePlan packagePlan) {
        switch (packagePlan.getPackageType()) {
            case MONTHLY:
                return startDate.plusMonths(1);
            case YEARLY:
                return startDate.plusYears(1);
            default:
                return startDate.plusMonths(1); // Mặc định 1 tháng
        }
    }
}