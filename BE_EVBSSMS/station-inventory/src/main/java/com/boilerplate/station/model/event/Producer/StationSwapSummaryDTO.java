package com.boilerplate.station.model.event.Producer;

import com.boilerplate.station.enums.TimeSlot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class StationSwapSummaryDTO {
    private Long stationId;
    private String stationName;
    private String date; // yyyy-MM-dd
    private Map<TimeSlot, Integer> swapCountBySlot;
}
