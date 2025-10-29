package com.boilerplate.billing.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "package_payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackagePayment extends BasePayment {

    // ID gói thuê pin (tham chiếu đến bảng package hoặc subscription)
    private Long packageId;
    private LocalDate startDate;
    private LocalDate endDate;
}
