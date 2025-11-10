package com.boilerplate.station.repository;

import com.boilerplate.station.model.entity.ChargeLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChargeLogRepository extends JpaRepository<ChargeLog, Long> {
}
