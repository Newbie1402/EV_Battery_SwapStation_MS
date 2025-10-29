package com.boilerplate.billing.model.entity;

import com.boilerplate.billing.enums.PackageStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "swap_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SwapPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên gói: ví dụ "Gói 10 lượt", "Gói 20 lượt", "Gói 1 tháng"
    @Column(nullable = false)
    private String packageName;

    // Tổng số lượt đổi pin mà gói này cho phép
    @Column(nullable = false)
    private Integer totalSwaps;

    // Thời hạn gói (tính bằng ngày), ví dụ: 30 = gói 1 tháng
    private Integer durationDays;

    // Trạng thái: ACTIVE, INACTIVE (nếu bạn có enum riêng thì dùng @Enumerated)
    private PackageStatus status;

    // Ngày tạo và cập nhật
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
