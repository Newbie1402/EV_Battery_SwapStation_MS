package com.boilerplate.billing.repository;

import com.boilerplate.billing.model.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Payment findByBookingId(Long bookingId);
}
