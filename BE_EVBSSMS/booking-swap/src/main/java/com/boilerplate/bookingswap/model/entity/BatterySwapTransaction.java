package com.boilerplate.bookingswap.model.entity;

import com.boilerplate.bookingswap.enums.PaymentMethod;
import com.boilerplate.bookingswap.enums.TransactionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "battery_swap_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatterySwapTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String bookingId;
    private String stationId;
    private String driverId;
    private String oldBatteryId;
    private String newBatteryId;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private LocalDateTime createdAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private TransactionStatus transactionStatus;
}
