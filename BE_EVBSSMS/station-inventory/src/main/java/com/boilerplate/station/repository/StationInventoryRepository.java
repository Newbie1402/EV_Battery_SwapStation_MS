package com.boilerplate.station.repository;

import com.boilerplate.station.model.entity.StationInventory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StationInventoryRepository extends JpaRepository<StationInventory, Long> {
}
