package com.boilerplate.billing.repository;

import com.boilerplate.billing.model.entity.MonthlyReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MonthlyReportRepository extends JpaRepository<MonthlyReport, Long> {
    Optional<MonthlyReport> findByYearAndMonth(int year, int month);
}
