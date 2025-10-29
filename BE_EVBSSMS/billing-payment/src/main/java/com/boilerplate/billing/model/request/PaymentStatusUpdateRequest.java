package com.boilerplate.billing.model.request;

import com.boilerplate.billing.enums.PaymentStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentStatusUpdateRequest {
    private Long paymentId;
    private PaymentStatus newStatus;
}
