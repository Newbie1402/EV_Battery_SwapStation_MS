package com.boilerplate.station.repository;

import com.boilerplate.station.model.entity.StationHealthLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StationHealthLogRepository extends JpaRepository<StationHealthLog, Long> {
}
