package com.boilerplate.auth.entity;

import com.boilerplate.auth.enums.VehicleStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho phương tiện của tài xế
 * Một tài xế có thể có nhiều phương tiện (tối thiểu 1)
 */
@Entity
@Table(name = "vehicles", indexes = {
    @Index(name = "idx_vehicle_id", columnList = "vehicle_id"),
    @Index(name = "idx_vin", columnList = "vin"),
    @Index(name = "idx_license_plate", columnList = "license_plate"),
    @Index(name = "idx_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Mã xe công khai (Vehicle ID)
     * Format: EV + 2 số cuối biển số + ddMMYY + model
     * Ví dụ: EV45141124VFe34 (biển số 30A12345, ngày 14/11/24, model VF e34)
     */
    @Column(name = "vehicle_id", nullable = false, unique = true, length = 50)
    private String vehicleId;

    /**
     * VIN - Vehicle Identification Number (Số khung xe)
     */
    @Column(nullable = false, unique = true, length = 17)
    private String vin;

    /**
     * Model xe (ví dụ: VF e34, VF 8, VF 9)
     */
    @Column(nullable = false, length = 50)
    private String model;

    /**
     * Biển số xe
     */
    @Column(name = "license_plate", nullable = false, unique = true, length = 20)
    private String licensePlate;

    /**
     * Loại pin (ví dụ: LFP 42kWh, NCM 87.7kWh)
     */
    @Column(name = "battery_type", nullable = false, length = 50)
    private String batteryType;

    /**
     * Dung lượng pin (kWh)
     */
    @Column(name = "battery_capacity")
    private Double batteryCapacity;

    /**
     * Trạng thái phương tiện
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private VehicleStatus status = VehicleStatus.ACTIVE;

    /**
     * Người sở hữu phương tiện
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    /**
     * Ghi chú
     */
    @Column(columnDefinition = "TEXT")
    private String notes;

    /**
     * URL ảnh xe (lưu trên AWS S3)
     */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /**
     * Thời gian tạo
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Thời gian cập nhật
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
