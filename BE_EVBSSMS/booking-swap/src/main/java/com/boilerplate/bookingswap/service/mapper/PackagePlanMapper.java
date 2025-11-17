package com.boilerplate.bookingswap.service.mapper;

import com.boilerplate.bookingswap.model.entity.PackagePlan;
import com.boilerplate.bookingswap.model.dto.request.PackagePlanRequest;
import com.boilerplate.bookingswap.model.dto.request.PackagePlanUpdateRequest;
import com.boilerplate.bookingswap.model.dto.respone.PackagePlanResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Mapper chuyển đổi giữa PackagePlan Entity và DTOs
 */
@Component
public class PackagePlanMapper {

    /**
     * Chuyển đổi từ Request DTO sang Entity
     * @param dto Request DTO
     * @return PackagePlan entity
     */
    public PackagePlan toEntity(PackagePlanRequest dto) {
        if (dto == null) {
            return null;
        }

        return PackagePlan.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .maxSwapPerMonth(dto.getMaxSwapPerMonth())
                .price(dto.getPrice())
                .packageType(dto.getPackageType())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Chuyển đổi từ Entity sang Response DTO
     * @param entity PackagePlan entity
     * @return Response DTO
     */
    public PackagePlanResponse toResponseDTO(PackagePlan entity) {
        if (entity == null) {
            return null;
        }

        return PackagePlanResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .maxSwapPerMonth(entity.getMaxSwapPerMonth())
                .price(entity.getPrice())
                .packageType(entity.getPackageType())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Cập nhật Entity từ Update DTO
     * @param entity Entity cần update
     * @param dto Update DTO
     */
    public void updateEntityFromDTO(PackagePlan entity, PackagePlanUpdateRequest dto) {
        if (entity == null || dto == null) {
            return;
        }

        if (dto.getName() != null) {
            entity.setName(dto.getName());
        }

        if (dto.getDescription() != null) {
            entity.setDescription(dto.getDescription());
        }

        if (dto.getMaxSwapPerMonth() != null) {
            entity.setMaxSwapPerMonth(dto.getMaxSwapPerMonth());
        }

        if (dto.getPrice() != null) {
            entity.setPrice(dto.getPrice());
        }

        if (dto.getPackageType() != null) {
            entity.setPackageType(dto.getPackageType());
        }

        entity.setUpdatedAt(LocalDateTime.now());
    }
}

