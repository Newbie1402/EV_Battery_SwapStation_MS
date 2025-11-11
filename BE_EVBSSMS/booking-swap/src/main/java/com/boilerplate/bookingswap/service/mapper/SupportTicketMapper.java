package com.boilerplate.bookingswap.service.mapper;

import com.boilerplate.bookingswap.enums.TicketStatus;
import com.boilerplate.bookingswap.model.entity.SupportTicket;
import com.boilerplate.bookingswap.model.dto.request.SupportTicketRequest;
import com.boilerplate.bookingswap.model.dto.request.SupportTicketUpdateRequest;
import com.boilerplate.bookingswap.model.dto.respone.SupportTicketResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Mapper chuyển đổi giữa SupportTicket Entity và DTOs
 */
@Component
public class SupportTicketMapper {

    /**
     * Chuyển đổi từ Request DTO sang Entity
     * @param dto Request DTO
     * @return SupportTicket entity
     */
    public SupportTicket toEntity(SupportTicketRequest dto) {
        if (dto == null) {
            return null;
        }

        return SupportTicket.builder()
                .driverId(dto.getDriverId())
                .bookingId(dto.getBookingId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .ticketStatus(TicketStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Chuyển đổi từ Entity sang Response DTO
     * @param entity SupportTicket entity
     * @return Response DTO
     */
    public SupportTicketResponse toResponseDTO(SupportTicket entity) {
        if (entity == null) {
            return null;
        }

        return SupportTicketResponse.builder()
                .id(entity.getId())
                .driverId(entity.getDriverId())
                .bookingId(entity.getBookingId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .ticketStatus(entity.getTicketStatus())
                .response(entity.getResponse())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Cập nhật Entity từ Update DTO (Admin/Staff update)
     * @param entity Entity cần update
     * @param dto Update DTO
     */
    public void updateEntityFromDTO(SupportTicket entity, SupportTicketUpdateRequest dto) {
        if (entity == null || dto == null) {
            return;
        }

        if (dto.getTicketStatus() != null) {
            entity.setTicketStatus(dto.getTicketStatus());
        }

        if (dto.getResponse() != null) {
            entity.setResponse(dto.getResponse());
        }

        entity.setUpdatedAt(LocalDateTime.now());
    }
}

