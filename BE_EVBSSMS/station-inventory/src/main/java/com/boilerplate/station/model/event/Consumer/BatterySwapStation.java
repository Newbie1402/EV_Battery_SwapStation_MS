package com.boilerplate.station.model.event.Consumer;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BatterySwapStation {
    private String BatteryId;     // ID pin mới cấp cho người dùng
    private String oldstationId;           // Tram thực hiện đổi
    private String newstationId;        // Trạm nơi đổi pin
    private String swapStatus;     // SUCCESS, FAILED, PENDING
}
