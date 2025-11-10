package com.boilerplate.station.model.createRequest;

import lombok.Data;

@Data
public class NearestStationRequest {
    private double latitude;
    private double longitude;
}
