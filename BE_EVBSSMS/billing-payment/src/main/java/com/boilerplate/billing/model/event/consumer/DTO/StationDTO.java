package com.boilerplate.billing.model.event.consumer.DTO;


import lombok.Data;

@Data
public class StationDTO {
    private Long id;
    private String stationCode;
    private String stationName;
    private String address;
}
