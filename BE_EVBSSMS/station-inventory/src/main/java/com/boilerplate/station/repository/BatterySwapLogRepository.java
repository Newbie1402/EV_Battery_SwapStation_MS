package com.boilerplate.station.repository;

import com.boilerplate.station.model.DTO.StationSwapTimeSlotDTO;
import com.boilerplate.station.model.entity.BatterySwapLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BatterySwapLogRepository extends JpaRepository<BatterySwapLog, Long> {

    // Lấy tất cả log của 1 trạm
    List<BatterySwapLog> findByStationId(Long stationId);

    // Lấy log theo trạm và khoảng thời gian
    List<BatterySwapLog> findByStationIdAndSwapTimeBetween(Long stationId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT DISTINCT b.station.id FROM BatterySwapLog b")
    List<Long> findAllStationIds();
}
