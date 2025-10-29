package com.boilerplate.billing.model.request;

import com.boilerplate.billing.enums.PaymentMethod;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SingleSwapPaymentRequest {
    private Long customerId;
    private Long bookingId;
    private Long stationId;
    private Double totalAmount;
    private PaymentMethod method;
    private String description;
}
