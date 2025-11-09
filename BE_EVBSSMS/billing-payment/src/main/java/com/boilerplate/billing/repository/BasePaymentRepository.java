package com.boilerplate.billing.repository;

import com.boilerplate.billing.model.entity.BasePayment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BasePaymentRepository extends JpaRepository<BasePayment, Long> {
}
