package com.boilerplate.station.model.event.Consumer;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BatterySwapStation {
    private Long bookingId;        // ID của phiên đặt trước
    private Long oldBatteryId;     // ID pin cũ người dùng mang đến
    private Long newBatteryId;     // ID pin mới cấp cho người dùng
    private Long oldstationId;           // Tram thực hiện đổi
    private Long newstationId;        // Trạm nơi đổi pin
    private String swapStatus;     // SUCCESS, FAILED, PENDING
}
