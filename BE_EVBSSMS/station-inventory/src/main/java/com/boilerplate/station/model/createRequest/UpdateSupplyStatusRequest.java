package com.boilerplate.station.model.createRequest;

import com.boilerplate.station.enums.SupplyRequestStatus;
import lombok.Data;

@Data
public class UpdateSupplyStatusRequest {
    private SupplyRequestStatus status;
    private String adminNote;
}
