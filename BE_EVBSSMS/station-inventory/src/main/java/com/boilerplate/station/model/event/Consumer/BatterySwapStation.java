package com.boilerplate.station.model.event.Consumer;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BatterySwapStation {
    private Long bookingId;        // ID của phiên đặt trước
    private String oldBatteryId;     // ID pin cũ người dùng mang đến
    private String newBatteryId;     // ID pin mới cấp cho người dùng
    private String oldstationId;           // Tram thực hiện đổi
    private String newstationId;        // Trạm nơi đổi pin
    private String swapStatus;     // SUCCESS, FAILED, PENDING
}
