package com.boilerplate.station.service;

import com.boilerplate.station.enums.TimeSlot;

import com.boilerplate.station.model.event.Producer.BatterySwapSummary;
import com.boilerplate.station.repository.BatterySwapLogRepository;
import com.boilerplate.station.repository.BatterySwapSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DailySwapSummaryService {

    private final BatterySwapLogRepository swapLogRepository;
    private final BatterySwapSummaryRepository summaryRepository;

    // Chạy mỗi ngày lúc 17:00
    @Scheduled(cron = "0 0 17 * * ?")
    public void generateDailySummary() {
        LocalDate yesterday = LocalDate.now().minusDays(1);

        // Lấy tất cả stationId đã có swap hôm qua
        List<Long> stationIds = swapLogRepository.findAllStationIds();

        for (Long stationId : stationIds) {
            for (TimeSlot slot : TimeSlot.values()) {
                LocalDateTime slotStart = yesterday.atTime(slot.getStartHour(), 0);
                LocalDateTime slotEnd = yesterday.atTime(slot.getEndHour(), 0);

                int count = swapLogRepository
                        .findByStationIdAndSwapTimeBetween(stationId, slotStart, slotEnd)
                        .size();

                BatterySwapSummary summary = BatterySwapSummary.builder()
                        .stationId(stationId)
                        .date(yesterday)
                        .timeSlot(slot)
                        .swapCount(count)
                        .build();

                summaryRepository.save(summary);
            }
        }

        System.out.println("Đã tổng hợp swap logs cho ngày " + yesterday);
    }
}
