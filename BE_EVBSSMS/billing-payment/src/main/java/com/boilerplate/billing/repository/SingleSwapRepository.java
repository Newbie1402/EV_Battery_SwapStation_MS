package com.boilerplate.billing.repository;

import com.boilerplate.billing.model.entity.SingleSwapPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SingleSwapRepository extends JpaRepository<SingleSwapPayment, Long> {
}
