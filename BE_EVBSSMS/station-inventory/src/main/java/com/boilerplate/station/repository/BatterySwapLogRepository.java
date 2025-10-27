package com.boilerplate.station.repository;

import com.boilerplate.station.model.entity.BatterySwapLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BatterySwapLogRepository extends JpaRepository<BatterySwapLog, Long> {

    List<BatterySwapLog> findByStationId(Long StationId);
}
