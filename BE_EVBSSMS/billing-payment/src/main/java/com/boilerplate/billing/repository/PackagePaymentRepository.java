package com.boilerplate.billing.repository;

import com.boilerplate.billing.model.entity.PackagePayment;
import com.boilerplate.billing.model.event.consumer.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PackagePaymentRepository extends JpaRepository<PackagePayment, Long> {

    List<PackagePayment> findByCustomerId(Driver customerId);
}
