package com.boilerplate.billing.repository;

import com.boilerplate.billing.model.entity.PackagePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface PackagePaymentRepository extends JpaRepository<PackagePayment, Long> {
}
