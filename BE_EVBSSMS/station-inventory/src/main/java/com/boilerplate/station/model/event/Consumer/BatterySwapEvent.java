package com.boilerplate.station.model.event.Consumer;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BatterySwapEvent {
    private Long bookingId;        // ID của phiên đặt trước
    private Long oldBatteryId;     // ID pin cũ người dùng mang đến
    private Long newBatteryId;     // ID pin mới cấp cho người dùng
    private double SoC;            // State of Charge của pin mới
    private Long verhiceId;           // Xe thực hiện đổi
    private Long stationId;        // Trạm nơi đổi pin
    private String swapStatus;     // SUCCESS, FAILED, PENDING
}
