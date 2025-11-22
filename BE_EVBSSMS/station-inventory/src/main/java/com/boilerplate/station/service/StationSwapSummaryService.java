package com.boilerplate.station.service;

import com.boilerplate.station.enums.TimeSlot;
import com.boilerplate.station.model.entity.BatterySwapLog;
import com.boilerplate.station.model.entity.Station;
import com.boilerplate.station.model.event.Producer.StationSwapSummaryDTO;
import com.boilerplate.station.repository.BatterySwapLogRepository;
import com.boilerplate.station.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StationSwapSummaryService {

    private final BatterySwapLogRepository swapLogRepository;
    private final StationRepository stationRepository;

    /**
     * Lấy tất cả swap, gom theo trạm, ngày, khung giờ
     */
    public List<StationSwapSummaryDTO> getAllSwapSummary() {
        List<StationSwapSummaryDTO> result = new ArrayList<>();

        // Lấy tất cả trạm
        List<Station> stations = stationRepository.findAll();

        for (Station station : stations) {
            // Lấy tất cả swap của trạm này
            List<BatterySwapLog> swaps = swapLogRepository.findByStationId(station.getId());

            // Gom theo ngày
            Map<LocalDate, Map<TimeSlot, Integer>> summaryMap = new TreeMap<>();

            for (BatterySwapLog log : swaps) {
                LocalDate date = log.getSwapTime().toLocalDate();

                summaryMap.putIfAbsent(date, new LinkedHashMap<>());
                Map<TimeSlot, Integer> slotMap = summaryMap.get(date);

                for (TimeSlot slot : TimeSlot.values()) {
                    LocalDateTime start = date.atTime(slot.getStartHour(), 0);
                    LocalDateTime end;
                    if(slot.getEndHour() == 24){
                        end = date.plusDays(1).atTime(0, 0);
                    } else {
                        end = date.atTime(slot.getEndHour(), 0);
                    }

                    slotMap.put(slot, slotMap.getOrDefault(slot, 0)
                            + (log.getSwapTime().isEqual(start) || log.getSwapTime().isAfter(start)
                            && log.getSwapTime().isBefore(end) ? 1 : 0));
                }
            }

            // Chuyển summaryMap thành DTO
            for (Map.Entry<LocalDate, Map<TimeSlot, Integer>> entry : summaryMap.entrySet()) {
                StationSwapSummaryDTO dto = StationSwapSummaryDTO.builder()
                        .stationId(station.getId())
                        .stationName(station.getStationName())
                        .date(entry.getKey().toString())
                        .swapCountBySlot(entry.getValue())
                        .build();
                result.add(dto);
            }
        }

        return result;
    }
}
