package com.boilerplate.billing.repository;

import com.boilerplate.billing.model.entity.SingleSwapPayment;
import com.boilerplate.billing.model.event.consumer.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SingleSwapPaymentRepository extends JpaRepository<SingleSwapPayment, Long> {

    List<SingleSwapPayment> findByCustomerId(Driver customerId);
}
