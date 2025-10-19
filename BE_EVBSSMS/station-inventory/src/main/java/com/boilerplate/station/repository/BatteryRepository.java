package com.boilerplate.station.repository;

import com.boilerplate.station.model.entity.Battery;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatteryRepository extends JpaRepository<Battery, Long> {
}
