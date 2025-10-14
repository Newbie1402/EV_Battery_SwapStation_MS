package com.boilerplate.station.model.createRequest;

import com.boilerplate.station.enums.StationStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationRequest {
    private String stationCode;
    private String stationName;
    private Double latitude;
    private Double longitude;
    private String address;
    private String phoneNumber;
    private int totalSlots;
    private int availableSlots;
    private StationStatus status;
}
