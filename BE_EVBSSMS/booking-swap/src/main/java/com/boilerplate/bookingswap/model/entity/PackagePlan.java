package com.boilerplate.bookingswap.model.entity;

import com.boilerplate.bookingswap.enums.PackageType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "package_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackagePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name; // tên gói, ví dụ: "Gói Cơ bản", "Gói Premium"
    private String description;

    private int maxSwapPerMonth; // số lần đổi pin/tháng
    private BigDecimal price; // giá gói

    @Enumerated(EnumType.STRING)
    private PackageType packageType; // loại gói (THUÊ_THEO_THÁNG, THUÊ_THEO_NĂM)

    @OneToMany(mappedBy = "packagePlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserPackageSubscription> subscriptions = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
