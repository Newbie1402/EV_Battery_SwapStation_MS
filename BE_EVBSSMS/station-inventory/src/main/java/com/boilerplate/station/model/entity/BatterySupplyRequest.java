package com.boilerplate.station.model.entity;

import com.boilerplate.station.enums.SupplyRequestStatus;
import com.boilerplate.station.model.entity.Station;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "battery_supply_request")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class BatterySupplyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---- Trạm gửi yêu cầu ----
    @ManyToOne
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    // ---- Số lượng pin cần thêm ----
    private int requestedQuantity;

    // ---- Loại pin (tuỳ theo hệ thống pin bạn có: 48V/60V, Model, Capacity...) ----
    @Column(nullable = false)
    private String batteryModel; // hoặc BatteryTypeEnum


    // ---- Lý do thiếu pin ----
    @Column(columnDefinition = "TEXT")
    private String reason;

    // ---- Trạng thái yêu cầu ----
    @Enumerated(EnumType.STRING)
    private SupplyRequestStatus status;

    // ---- Thời điểm gửi yêu cầu ----
    private LocalDateTime createdAt;

    // ---- Thời điểm duyệt hoặc từ chối ----
    private LocalDateTime processedAt;

    // ---- Ghi chú của Admin khi xử lý ----
    @Column(columnDefinition = "TEXT")
    private String adminNote;
}
