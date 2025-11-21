package com.boilerplate.billing.model.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO chứa tất cả thanh toán của một customer (bao gồm cả swap và package)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerPaymentsDTO {

    private String customerId;
    private String customerName;
    private List<SingleSwapPaymentDTO> swapPayments;
    private List<PackagePaymentDTO> packagePayments;
    private Integer totalSwapPayments;
    private Integer totalPackagePayments;
    private Double totalAmount;
}

