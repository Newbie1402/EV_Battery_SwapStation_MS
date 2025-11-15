package com.boilerplate.bookingswap.model.dto.respone;

import com.boilerplate.bookingswap.enums.PackageStatus;
import com.boilerplate.bookingswap.enums.PackageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO trả dữ liệu gói thuê pin về cho client
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackagePlanResponse {

    /** Id gói thuê pin */
    private Long id;

    /** Tên gói thuê pin */
    private String name;

    /** Mô tả gói thuê pin */
    private String description;

    /** Số lần đổi pin tối đa mỗi tháng */
    private Integer maxSwapPerMonth;

    /** Giá gói thuê pin */
    private BigDecimal price;

    /** Loại gói thuê */
    private PackageType packageType;

    /** Trạng thái gói */
    private PackageStatus status;

    /** Thời gian tạo */
    private LocalDateTime createdAt;

    /** Thời gian cập nhật */
    private LocalDateTime updatedAt;
}


