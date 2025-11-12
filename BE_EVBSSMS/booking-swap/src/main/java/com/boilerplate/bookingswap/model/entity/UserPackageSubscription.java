package com.boilerplate.bookingswap.model.entity;

import com.boilerplate.bookingswap.enums.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_package_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPackageSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    // ID người dùng lấy từ Auth-service
    @Column(nullable = false)
    private String userId;

    // Liên kết đến gói thuê pin
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private PackagePlan packagePlan;

    // Ngày bắt đầu gói thuê
    @Column(nullable = false)
    private LocalDateTime startDate;

    // Ngày hết hạn gói thuê
    @Column(nullable = false)
    private LocalDateTime endDate;

    // Số lần đổi pin đã sử dụng trong gói hiện tại
    @Column(nullable = false)
    private int usedSwaps = 0;

    // Trạng thái gói
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
