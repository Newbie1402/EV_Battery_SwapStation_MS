package com.boilerplate.station.repository;

import com.boilerplate.station.model.entity.BatteryReturnLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatteryReturnLogRepository extends JpaRepository<BatteryReturnLog, Long> {
}
