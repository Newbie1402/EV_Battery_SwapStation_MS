package com.boilerplate.bookingswap.service.mapper;

import com.boilerplate.bookingswap.model.entity.Rating;
import com.boilerplate.bookingswap.model.dto.request.RatingRequest;
import com.boilerplate.bookingswap.model.dto.respone.RatingResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Mapper chuyển đổi giữa Rating Entity và DTOs
 */
@Component
public class RatingMapper {

    /**
     * Chuyển đổi từ Request DTO sang Entity
     * @param dto Request DTO
     * @return Rating entity
     */
    public Rating toEntity(RatingRequest dto) {
        if (dto == null) {
            return null;
        }

        return Rating.builder()
                .bookingId(dto.getBookingId())
                .driverId(dto.getDriverId())
                .stationId(dto.getStationId())
                .score(dto.getScore())
                .comment(dto.getComment())
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Chuyển đổi từ Entity sang Response DTO
     * @param entity Rating entity
     * @return Response DTO
     */
    public RatingResponse toResponseDTO(Rating entity) {
        if (entity == null) {
            return null;
        }

        return RatingResponse.builder()
                .id(entity.getId())
                .bookingId(entity.getBookingId())
                .driverId(entity.getDriverId())
                .stationId(entity.getStationId())
                .score(entity.getScore())
                .comment(entity.getComment())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

