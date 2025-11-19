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
     * Xác thực OTP (DEPRECATED - đã chuyển sang verification token qua email)
     *
     * LƯUÝ: API này đã lỗi thời. Luồng mới:
     * 1. Admin approve đơn đăng ký
     * 2. User nhận email có link xác nhận (hiệu lực 48 giờ)
     * 3. User click link -> tài khoản được kích hoạt
     * 4. User có thể đăng nhập
     *
     * API này giữ lại để tương thích ngược, nhưng không nên sử dụng cho registration mới
     */
    @PostMapping("/verify-otp")
    @Deprecated
    @Operation(summary = "[DEPRECATED] Xác thực OTP",
               description = "API này đã lỗi thời. Vui lòng sử dụng link xác nhận trong email thay vì OTP")
    public ResponseEntity<ResponseData<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        log.info("Nhận yêu cầu xác thực OTP (DEPRECATED): email={}", request.getEmail());
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
     * Gửi lại OTP (DEPRECATED - đã chuyển sang verification token qua email)
     *
     * LƯUÝ: API này đã lỗi thời. Nếu user không nhận được email xác nhận,
     * cần liên hệ admin để được hỗ trợ hoặc admin approve lại để gửi email mới
     */
    @PostMapping("/resend-otp")
    @Deprecated
    @Operation(summary = "[DEPRECATED] Gửi lại OTP",
               description = "API này đã lỗi thời. Vui lòng liên hệ admin nếu không nhận được email xác nhận")
    public ResponseEntity<ResponseData<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        log.info("Nhận yêu cầu gửi lại OTP (DEPRECATED): email={}", request.getEmail());
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
