package com.boilerplate.auth.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO cho đăng nhập bằng Google OAuth2
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuth2LoginRequest {

    /**
     * Google ID Token nhận được từ Google OAuth2
     */
    @NotBlank(message = "Google ID Token không được để trống")
    private String idToken;
}
