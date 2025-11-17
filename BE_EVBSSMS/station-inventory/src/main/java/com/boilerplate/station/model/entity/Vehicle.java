package com.boilerplate.station.model.entity;

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

    @Column(name = "vehicle_id", nullable = false, unique = true, length = 50)
    private String vehicleId;


    @Column(nullable = false, unique = true, length = 17)
    private String vin;


    @Column(nullable = false, length = 50)
    private String model;


    @Column(name = "license_plate", nullable = false, unique = true, length = 20)
    private String licensePlate;

    @Column(name = "battery_type", nullable = false, length = 50)
    private String batteryType;

    @Column(name = "battery_capacity")
    private Double batteryCapacity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Driver user;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
