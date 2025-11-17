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
    private String verhiceId;           // Xe thực hiện đổi
    private String stationId;        // Trạm nơi đổi pin
    private String swapStatus;     // SUCCESS, FAILED, PENDING
}
