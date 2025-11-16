package com.boilerplate.auth.model.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO cho việc cập nhật thông tin nhân viên
 * Chỉ dành cho Admin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStaffRequest {

    /**
     * Số điện thoại
     */
    @Pattern(regexp = "^(\\+84|0)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    /**
     * Họ và tên đầy đủ
     */
    @Size(min = 2, max = 100, message = "Họ và tên phải từ 2-100 ký tự")
    private String fullName;

    /**
     * Ngày sinh
     */
    private LocalDate birthday;

    /**
     * Địa chỉ
     */
    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;
}

