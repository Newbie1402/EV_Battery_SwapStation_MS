package com.boilerplate.billing.repository;

import com.boilerplate.billing.model.event.consumer.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Integer> {
    Optional<Driver> findByEmployeeId(String employeeId);
}
