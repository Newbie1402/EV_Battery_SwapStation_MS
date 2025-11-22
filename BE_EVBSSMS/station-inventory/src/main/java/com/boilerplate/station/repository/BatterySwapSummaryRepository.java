package com.boilerplate.station.repository;

import com.boilerplate.station.model.event.Producer.BatterySwapSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BatterySwapSummaryRepository extends JpaRepository<BatterySwapSummary, Long> {
}
