package com.boilerplate.station.model.event.Consumer;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BatterySwapEvent {

    private String oldBatteryId;     // ID pin cũ người dùng mang đến
    private String newBatteryId;     // ID pin mới cấp cho người dùng

    @JsonProperty("vehicleId")
    private String vehicleId;           // Xe thực hiện đổi

    private String stationId;        // Trạm nơi đổi pin
    private String swapStatus;     // SUCCESS, FAILED, PENDING
}
