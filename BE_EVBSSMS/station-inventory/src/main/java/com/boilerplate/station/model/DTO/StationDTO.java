package com.boilerplate.station.model.DTO;

import com.boilerplate.station.enums.StationStatus;
import com.boilerplate.station.model.entity.Battery;
import com.boilerplate.station.model.entity.Station;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationDTO {
    private Long id;
    private String stationCode;
    private String stationName;
    private Double latitude;
    private Double longitude;
    private String address;
    private String phoneNumber;
    private int totalSlots;
    private int availableSlots;
    private StationStatus status;
    private List<BatteryDTO> batteries;
    private List<String> staffCode;

    public static StationDTO fromEntity(Station station) {
        if (station == null) return null;
        return StationDTO.builder()
                .id(station.getId())
                .stationCode(station.getStationCode())
                .stationName(station.getStationName())
                .latitude(station.getLatitude())
                .longitude(station.getLongitude())
                .address(station.getAddress())
                .phoneNumber(station.getPhoneNumber())
                .totalSlots(station.getTotalSlots())
                .availableSlots(station.getAvailableSlots())
                .status(station.getStatus())
                .staffCode(station.getStaffs())
                .batteries(
                        station.getBatteries()
                                .stream()
                                .map(BatteryDTO::fromEntity) // gọi fromEntity cho từng Battery
                                .collect(Collectors.toList())
                )
                .build();
    }
}
