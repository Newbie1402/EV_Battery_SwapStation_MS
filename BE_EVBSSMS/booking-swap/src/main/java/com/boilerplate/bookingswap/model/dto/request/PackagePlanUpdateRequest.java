package com.boilerplate.bookingswap.model.dto.request;

import com.boilerplate.bookingswap.enums.PackageType;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO nhận dữ liệu yêu cầu cập nhật gói thuê pin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackagePlanUpdateRequest {

    /** Tên gói thuê pin */
    private String name;

    /** Mô tả gói thuê pin */
    private String description;

    /** Số lần đổi pin tối đa mỗi tháng */
    @Min(value = 1, message = "Số lần đổi pin tối thiểu là 1")
    private Integer maxSwapPerMonth;

    /** Giá gói thuê pin */
    @Min(value = 0, message = "Giá phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    /** Loại gói thuê */
    private PackageType packageType;
}