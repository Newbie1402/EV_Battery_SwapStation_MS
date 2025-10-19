package com.boilerplate.station.repository;

import com.boilerplate.station.model.entity.BatterySlot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatterySlotRepository extends JpaRepository<BatterySlot, Long> {
}
