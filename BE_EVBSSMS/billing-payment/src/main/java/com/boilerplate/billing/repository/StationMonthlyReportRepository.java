package com.boilerplate.billing.repository;

import com.boilerplate.billing.model.entity.StationMonthlyReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StationMonthlyReportRepository extends JpaRepository<StationMonthlyReport, Long> {
    Optional<StationMonthlyReport> findByStationIdAndYearAndMonth(String stationId, int year, int month);
    List<StationMonthlyReport> findByYearAndMonth(int year, int month);
}
