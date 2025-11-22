package com.boilerplate.station.model.event.Producer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StationSwapTimeSlotDTO {
    private Long stationId;
    private String stationName;
    private String reportDate; // yyyy-MM-dd
    private String timeSlot;   // 01-06, 06-12,...
    private int swapCount;     // số lần đổi pin trong khung giờ
}
