package com.boilerplate.station.model.event.Consumer;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BatteryHoldEvent {
    private Long batteryId;        // ID pin được giữ
}
