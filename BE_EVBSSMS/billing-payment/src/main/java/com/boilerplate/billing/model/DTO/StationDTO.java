package com.boilerplate.billing.model.DTO;

import com.boilerplate.billing.model.entity.Station;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationDTO {

    private Long id;
    private String stationCode;
    private String stationName;
    private String address;
    private String phoneNumber;

    // ============================
    //        FROM ENTITY
    // ============================
    public static StationDTO fromEntity(Station station) {
        if (station == null) return null;

        return StationDTO.builder()
                .id(station.getId())
                .stationCode(station.getStationCode())
                .stationName(station.getStationName())
                .address(station.getAddress())
                .phoneNumber(station.getPhoneNumber())
                .build();
    }

    // ============================
    //          TO ENTITY
    // ============================
    public Station toEntity() {
        Station station = new Station();
        station.setId(this.id);
        station.setStationCode(this.stationCode);
        station.setStationName(this.stationName);
        station.setAddress(this.address);
        station.setPhoneNumber(this.phoneNumber);
        return station;
    }
}
