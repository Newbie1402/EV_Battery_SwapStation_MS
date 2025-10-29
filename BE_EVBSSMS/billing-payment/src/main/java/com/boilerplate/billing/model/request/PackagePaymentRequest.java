package com.boilerplate.billing.model.request;

import com.boilerplate.billing.enums.PaymentMethod;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackagePaymentRequest {
    private Long packageId;
    private Long customerId;
    private Double totalAmount;
    private PaymentMethod method;
}
