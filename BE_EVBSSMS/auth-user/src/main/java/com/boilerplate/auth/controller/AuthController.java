package com.boilerplate.auth.controller;

import com.boilerplate.auth.model.dto.request.*;
import com.boilerplate.auth.model.dto.response.AuthResponse;
import com.boilerplate.auth.model.response.ResponseData;
import com.boilerplate.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý các API xác thực với Google OAuth2
 * Luồng: Đăng ký → Chờ Admin duyệt → OTP → Đăng nhập
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "APIs xác thực và đăng ký tài khoản qua Google OAuth2")
public class AuthController {

    private final AuthService authService;

    /**
     * Đăng ký tài khoản mới qua Google OAuth2 (Driver hoặc Staff)
     * Tài khoản sẽ ở trạng thái PENDING_APPROVAL, chờ admin duyệt
     */
    @PostMapping("/oauth2/google/register")
    @Operation(summary = "Đăng ký bằng Google OAuth2",
               description = "Đăng ký tài khoản mới bằng Google OAuth2. Sau khi đăng ký, đơn sẽ chờ Admin phê duyệt.")
    public ResponseEntity<ResponseData<AuthResponse>> registerWithGoogle(@Valid @RequestBody OAuth2RegisterRequest request) {
        log.info("Nhận yêu cầu đăng ký bằng Google OAuth2: role={}", request.getRole());
        AuthResponse response = authService.registerWithGoogle(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ResponseData.<AuthResponse>builder()
                        .statusCode(response.getStatusCode())
                        .message(response.getMessage())
                        .data(response)
                        .build()
        );
    }

    /**
     * Đăng nhập bằng Google OAuth2
     * Chỉ cho phép đăng nhập nếu tài khoản đã được admin duyệt và xác thực OTP
     */
    @PostMapping("/oauth2/google/login")
    @Operation(summary = "Đăng nhập bằng Google OAuth2",
               description = "Đăng nhập bằng Google ID Token. Tài khoản phải đã được admin phê duyệt và xác thực OTP.")
    public ResponseEntity<ResponseData<AuthResponse>> loginWithGoogle(@Valid @RequestBody OAuth2LoginRequest request) {
        log.info("Nhận yêu cầu đăng nhập bằng Google OAuth2");
        AuthResponse response = authService.loginWithGoogle(request);

        return ResponseEntity.ok(
                ResponseData.<AuthResponse>builder()
                        .statusCode(response.getStatusCode())
                        .message(response.getMessage())
                        .data(response)
                        .build()
        );
    }

    /**
     * Xác thực OTP
     * Sau khi admin phê duyệt, user nhận mã OTP qua email
     * Verify OTP để kích hoạt tài khoản và nhận JWT token
     * Thông tin xe đã được thêm lúc đăng ký, không cần nhập lại
     * Sau khi xác thực thành công, user có thể đăng nhập
     */
    @PostMapping("/verify-otp")
    @Operation(summary = "Xác thực OTP",
               description = "Xác thực mã OTP được gửi qua email sau khi admin phê duyệt. Chỉ cần email và mã OTP (6 chữ số)")
    public ResponseEntity<ResponseData<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        log.info("Nhận yêu cầu xác thực OTP: email={}", request.getEmail());
        AuthResponse response = authService.verifyOtp(request);

        return ResponseEntity.ok(
                ResponseData.<AuthResponse>builder()
                        .statusCode(response.getStatusCode())
                        .message(response.getMessage())
                        .data(response)
                        .build()
        );
    }

    /**
     * Gửi lại OTP
     */
    @PostMapping("/resend-otp")
    @Operation(summary = "Gửi lại OTP",
               description = "Gửi lại mã OTP nếu người dùng chưa nhận được hoặc mã đã hết hạn")
    public ResponseEntity<ResponseData<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        log.info("Nhận yêu cầu gửi lại OTP: email={}", request.getEmail());
        authService.resendOtp(request);

        return ResponseEntity.ok(
                ResponseData.<Void>builder()
                        .statusCode(200)
                        .message("Đã gửi lại mã OTP. Vui lòng kiểm tra email.")
                        .build()
        );
    }

    /**
     * Làm mới access token
     */
    @PostMapping("/refresh-token")
    @Operation(summary = "Làm mới Access Token",
               description = "Sử dụng Refresh Token để lấy Access Token mới khi token cũ hết hạn")
    public ResponseEntity<ResponseData<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Nhận yêu cầu làm mới access token");
        AuthResponse response = authService.refreshToken(request);

        return ResponseEntity.ok(
                ResponseData.<AuthResponse>builder()
                        .statusCode(response.getStatusCode())
                        .message(response.getMessage())
                        .data(response)
                        .build()
        );
    }

    /**
     * Đăng xuất
     */
    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất",
               description = "Thu hồi Refresh Token và đăng xuất khỏi hệ thống")
    public ResponseEntity<ResponseData<Void>> logout(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Nhận yêu cầu đăng xuất");
        authService.logout(request.getRefreshToken());

        return ResponseEntity.ok(
                ResponseData.<Void>builder()
                        .statusCode(200)
                        .message("Đăng xuất thành công")
                        .build()
        );
    }
}
