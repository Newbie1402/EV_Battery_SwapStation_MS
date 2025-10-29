package com.boilerplate.billing.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "single_swap_payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SingleSwapPayment extends BasePayment {

    // ID booking hoặc lịch đổi pin cụ thể
    private Long bookingId;

    // ID trạm đổi pin nơi diễn ra giao dịch
    private Long stationId;

    private Long SwapLogId;
}
