package com.boilerplate.auth.controller;

import com.boilerplate.auth.entity.User;
import com.boilerplate.auth.model.response.ResponseData;
import com.boilerplate.auth.service.VerificationTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller xử lý xác nhận đăng ký qua email
 */
@RestController
@RequestMapping("/api/verification")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Verification", description = "APIs xác thực đăng ký qua email")
public class VerificationController {

    private final VerificationTokenService verificationTokenService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * Xác nhận đăng ký thông qua token
     */
    @GetMapping("/confirm")
    @Operation(
        summary = "Xác nhận đăng ký",
        description = "Endpoint để xác nhận đăng ký khi user click vào link trong email. " +
                     "Token có hiệu lực 48 giờ kể từ khi admin phê duyệt."
    )
    public ResponseEntity<ResponseData<Map<String, Object>>> confirmRegistration(
            @RequestParam String token) {
        log.info("Nhận yêu cầu xác nhận đăng ký với token: {}", token);

        User user = verificationTokenService.verifyToken(token);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("userId", user.getId());
        responseData.put("email", user.getEmail());
        responseData.put("fullName", user.getFullName());
        responseData.put("role", user.getRole());
        responseData.put("status", user.getStatus());
        responseData.put("redirectUrl", frontendUrl + "/login");

        return ResponseEntity.ok(
            ResponseData.<Map<String, Object>>builder()
                .statusCode(200)
                .message("Xác nhận đăng ký thành công! Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.")
                .data(responseData)
                .build()
        );
    }

    /**
     * Kiểm tra token có hợp lệ không
     */
    @GetMapping("/check-token")
    @Operation(
        summary = "Kiểm tra token",
        description = "Kiểm tra xem token có hợp lệ không (chưa sử dụng và chưa hết hạn)"
    )
    public ResponseEntity<ResponseData<Map<String, Boolean>>> checkToken(
            @RequestParam String token) {
        log.info("Kiểm tra token: {}", token);

        boolean isValid = verificationTokenService.isTokenValid(token);

        Map<String, Boolean> responseData = new HashMap<>();
        responseData.put("isValid", isValid);

        return ResponseEntity.ok(
            ResponseData.<Map<String, Boolean>>builder()
                .statusCode(200)
                .message(isValid ? "Token hợp lệ" : "Token không hợp lệ hoặc đã hết hạn")
                .data(responseData)
                .build()
        );
    }
}

