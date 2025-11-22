package com.boilerplate.station.model.createRequest;

import lombok.Data;

@Data
public class CreateSupplyRequest {

    private String stationCode;
    private int requestedQuantity;
    private String batteryModel;
    private String reason;
}
