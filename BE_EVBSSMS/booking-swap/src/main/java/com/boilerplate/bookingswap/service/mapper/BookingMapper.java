package com.boilerplate.bookingswap.service.mapper;

import com.boilerplate.bookingswap.enums.BookingStatus;
import com.boilerplate.bookingswap.model.entity.Booking;
import com.boilerplate.bookingswap.model.dto.request.BookingRequest;
import com.boilerplate.bookingswap.model.dto.request.BookingUpdateRequest;
import com.boilerplate.bookingswap.model.dto.respone.BookingResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Mapper chuyển đổi giữa Booking Entity và DTOs
 */
@Component
public class BookingMapper {

    /**
     * Chuyển đổi từ Request DTO sang Entity (Create)
     * @param dto Request DTO
     * @return Booking entity
     */
    public Booking toEntity(BookingRequest dto) {
        if (dto == null) {
            return null;
        }

        return Booking.builder()
                .driverId(dto.getDriverId())
                .stationId(dto.getStationId())
                .batteryModelId(dto.getBatteryModelId())
                .scheduledTime(dto.getScheduledTime())
                .paymentType(dto.getPaymentType())
                .packageId(dto.getPackageId())
                .notes(dto.getNotes())
                .bookingTime(LocalDateTime.now())
                .bookingStatus(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Chuyển đổi từ Entity sang Response DTO
     * @param entity Booking entity
     * @return Response DTO
     */
    public BookingResponse toResponseDTO(Booking entity) {
        if (entity == null) {
            return null;
        }

        return BookingResponse.builder()
                .id(entity.getId())
                .driverId(entity.getDriverId())
                .stationId(entity.getStationId())
                .batteryModelId(entity.getBatteryModelId())
                .bookingTime(entity.getBookingTime())
                .scheduledTime(entity.getScheduledTime())
                .paymentType(entity.getPaymentType())
                .paymentId(entity.getPaymentId())
                .IsPaid(entity.isPaid())
                .notes(entity.getNotes())
                .packageId(entity.getPackageId())
                .bookingStatus(entity.getBookingStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Cập nhật Entity từ Update DTO (chỉ update field không null)
     * @param entity Entity cần update
     * @param dto Update DTO
     */
    public void updateEntityFromDTO(Booking entity, BookingUpdateRequest dto) {
        if (entity == null || dto == null) {
            return;
        }

        if (dto.getScheduledTime() != null) {
            entity.setScheduledTime(dto.getScheduledTime());
        }

        if (dto.getPaymentType() != null) {
            entity.setPaymentType(dto.getPaymentType());
        }

        if (dto.getPaymentId() != null) {
            entity.setPaymentId(dto.getPaymentId());
        }

        if (dto.getNotes() != null) {
            entity.setNotes(dto.getNotes());
        }

        if (dto.getBookingStatus() != null) {
            entity.setBookingStatus(dto.getBookingStatus());
        }

        entity.setUpdatedAt(LocalDateTime.now());
    }
}