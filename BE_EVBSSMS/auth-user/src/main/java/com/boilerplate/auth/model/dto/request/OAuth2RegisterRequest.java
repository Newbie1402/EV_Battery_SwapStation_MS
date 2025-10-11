package com.boilerplate.auth.model.dto.request;

import com.boilerplate.auth.enums.Role;
import com.boilerplate.auth.model.request.AddVehicleRequest;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Request DTO cho đăng ký tài khoản mới qua Google OAuth2
 * Client chỉ cần gửi idToken, backend sẽ tự động verify và lấy thông tin từ Google
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuth2RegisterRequest {

    /**
     * Google ID Token (lấy từ Google Sign-In ở Frontend)
     * Backend sẽ verify token này với Google để lấy googleId, email, name, avatar
     */
    @NotBlank(message = "Google ID Token không được để trống")
    private String idToken;

    /**
     * Số điện thoại
     */
    @Pattern(regexp = "^(\\+84|0)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    /**
     * Ngày sinh
     */
    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    private LocalDate birthday;

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

    /**
     * Danh sách phương tiện (cho DRIVER)
     */
    private List<AddVehicleRequest> vehicles;
}
