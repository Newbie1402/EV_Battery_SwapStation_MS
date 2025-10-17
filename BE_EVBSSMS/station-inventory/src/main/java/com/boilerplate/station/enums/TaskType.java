package com.boilerplate.station.enums;

public enum TaskType {
    TRANSFER_BATTERY,   // Điều phối pin giữa các trạm
    SWAP_BATTERY,        // Xử lý yêu cầu đổi pin (xe -> trạm hoặc trạm -> xe)
    MAINTENANCE          // Bảo dưỡng pin / bảo trì trạm
}
