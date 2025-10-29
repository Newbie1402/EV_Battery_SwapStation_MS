package com.boilerplate.station.repository;

import com.boilerplate.station.model.entity.BatterySwapStationLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatterySwapStationLogRepository extends JpaRepository<BatterySwapStationLog, Long> {
}
