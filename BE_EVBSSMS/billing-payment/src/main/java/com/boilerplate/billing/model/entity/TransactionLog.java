package com.boilerplate.billing.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_logs")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
public class TransactionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String transactionId;
    private String paymentId;
    private String gatewayResponse; // JSON response từ cổng thanh toán

    private LocalDateTime logTime;

}
