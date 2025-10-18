package com.boilerplate.billing.model.request;

import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MomoPaymentRequest {
    private double amount;
    private Long orderId;
    private Long customerId;
    // getters, setters
}
