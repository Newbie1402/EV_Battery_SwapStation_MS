package com.boilerplate.bookingswap.service.mapper;

import com.boilerplate.bookingswap.enums.TransactionStatus;
import com.boilerplate.bookingswap.model.entity.BatterySwapTransaction;
import com.boilerplate.bookingswap.model.dto.request.BatterySwapTransactionRequest;
import com.boilerplate.bookingswap.model.dto.respone.BatterySwapTransactionResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Mapper chuyển đổi giữa BatterySwapTransaction Entity và DTOs
 */
@Component
public class BatterySwapTransactionMapper {

    /**
     * Chuyển đổi từ Request DTO sang Entity
     * @param dto Request DTO
     * @return BatterySwapTransaction entity
     */
    public BatterySwapTransaction toEntity(BatterySwapTransactionRequest dto) {
        if (dto == null) {
            return null;
        }

        return BatterySwapTransaction.builder()
                .bookingId(dto.getBookingId())
                .stationId(dto.getStationId())
                .driverId(dto.getDriverId())
                .oldBatteryId(dto.getOldBatteryId())
                .newBatteryId(dto.getNewBatteryId())
                .amount(dto.getAmount())
                .paymentMethod(dto.getPaymentMethod())
                .transactionStatus(TransactionStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Chuyển đổi từ Entity sang Response DTO
     * @param entity BatterySwapTransaction entity
     * @return Response DTO
     */
    public BatterySwapTransactionResponse toResponseDTO(BatterySwapTransaction entity) {
        if (entity == null) {
            return null;
        }

        return BatterySwapTransactionResponse.builder()
                .id(entity.getId())
                .bookingId(entity.getBookingId())
                .stationId(entity.getStationId())
                .driverId(entity.getDriverId())
                .oldBatteryId(entity.getOldBatteryId())
                .newBatteryId(entity.getNewBatteryId())
                .amount(entity.getAmount())
                .paymentMethod(entity.getPaymentMethod())
                .createdAt(entity.getCreatedAt())
                .transactionStatus(entity.getTransactionStatus())
                .build();
    }
}

