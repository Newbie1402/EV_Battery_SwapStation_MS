package com.boilerplate.station.model.DTO;

import com.boilerplate.station.model.entity.Station;
import lombok.Data;

@Data
public class NearestStationDTO {
    private Long id;
    private String stationName;
    private String address;
    private double latitude;
    private double longitude;
    private double distanceKm;

    public static NearestStationDTO fromEntity(Station station, double distanceKm) {
        NearestStationDTO dto = new NearestStationDTO();
        dto.setId(station.getId());
        dto.setStationName(station.getStationName());
        dto.setAddress(station.getAddress());
        dto.setLatitude(station.getLatitude());
        dto.setLongitude(station.getLongitude());
        dto.setDistanceKm(distanceKm);
        return dto;
    }
}
