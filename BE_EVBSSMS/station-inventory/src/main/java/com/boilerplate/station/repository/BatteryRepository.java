package com.boilerplate.station.repository;

import com.boilerplate.station.model.entity.Battery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BatteryRepository extends JpaRepository<Battery, Long> {
    Optional<Battery> findByBatteryCode(String code);

}
