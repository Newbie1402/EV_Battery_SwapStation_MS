package com.boilerplate.auth.model.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * DTO cho phản hồi xác thực (đăng nhập thành công)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private Integer statusCode;
    private String message;
    private String accessToken;
    private String refreshToken;
    private UserResponse user;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Object data; // Dữ liệu bổ sung (ví dụ: thông tin OAuth2)
}
