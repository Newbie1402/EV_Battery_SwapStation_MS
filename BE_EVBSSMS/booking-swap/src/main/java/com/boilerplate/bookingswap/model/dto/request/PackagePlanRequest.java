package com.boilerplate.bookingswap.model.dto.request;

import com.boilerplate.bookingswap.enums.PackageType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO nhận dữ liệu yêu cầu tạo gói thuê pin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackagePlanRequest {

    /** Tên gói thuê pin */
    @NotBlank(message = "Tên gói không được để trống")
    private String name;

    /** Mô tả gói thuê pin */
    private String description;

    /** Số lần đổi pin tối đa mỗi tháng */
    @NotNull(message = "maxSwapPerMonth không được để trống")
    @Min(value = 1, message = "Số lần đổi pin tối thiểu là 1")
    private Integer maxSwapPerMonth;

    /** Giá gói thuê pin */
    @NotNull(message = "Giá không được để trống")
    @Min(value = 0, message = "Giá phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    /** Loại gói thuê */
    @NotNull(message = "packageType không được để trống")
    private PackageType packageType;
}

