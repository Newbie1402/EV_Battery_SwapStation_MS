package com.boilerplate.station.model.event.Consumer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatterySwapEvent {
    private Long bookingId;        // ID của lượt booking (nếu có)
    private Long oldBatteryId;     // ID pin cũ người dùng mang đến
    private Long newBatteryId;     // ID pin mới cấp cho người dùng
    private Long userId;           // Người thực hiện đổi
    private Long stationId;        // Trạm nơi đổi pin
    private String swapTime;       // Thời gian đổi pin (ISO 8601)
    private String swapStatus;     // SUCCESS, FAILED, PENDING
}
