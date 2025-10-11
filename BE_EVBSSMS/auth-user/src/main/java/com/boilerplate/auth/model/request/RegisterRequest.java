package com.boilerplate.auth.model.request;

import com.boilerplate.auth.enums.Role;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO cho đăng ký tài khoản mới
 * Dùng cho cả DRIVER và STAFF
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    /**
     * Email (bắt buộc, unique)
     */
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    /**
     * Số điện thoại
     */
    @Pattern(regexp = "^(\\+84|0)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    /**
     * Họ và tên đầy đủ (bắt buộc)
     */
    @NotBlank(message = "Họ và tên không được để trống")
    @Size(min = 2, max = 100, message = "Họ và tên phải từ 2-100 ký tự")
    private String fullName;

    /**
     * Ngày sinh
     */
    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    private LocalDate birthday;

    /**
     * URL ảnh đại diện
     */
    private String avatar;

    /**
     * Vai trò đăng ký (DRIVER hoặc STAFF)
     */
    @NotNull(message = "Vai trò không được để trống")
    private Role role;

    /**
     * Địa chỉ
     */
    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;

    /**
     * Số CMND/CCCD (bắt buộc)
     */
    @NotBlank(message = "Số CMND/CCCD không được để trống")
    @Pattern(regexp = "^[0-9]{9,12}$", message = "Số CMND/CCCD phải từ 9-12 chữ số")
    private String identityCard;
}

