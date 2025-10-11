package com.boilerplate.auth.controller;

import com.boilerplate.auth.model.dto.request.UpdateProfileRequest;
import com.boilerplate.auth.model.dto.response.UserResponse;
import com.boilerplate.auth.model.response.ResponseData;
import com.boilerplate.auth.security.CustomUserDetails;
import com.boilerplate.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý API profile người dùng
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Profile", description = "APIs quản lý thông tin cá nhân")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    /**
     * Lấy thông tin profile hiện tại
     */
    @GetMapping("/profile")
    @Operation(summary = "Lấy thông tin profile", description = "Lấy thông tin profile của người dùng hiện tại")
    public ResponseEntity<ResponseData<UserResponse>> getCurrentProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Lấy thông tin profile cho user ID: {}", userDetails.getUserId());
        UserResponse response = userService.getCurrentUserProfile(userDetails.getUserId());

        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy thông tin thành công", response)
        );
    }

    /**
     * Cập nhật profile
     */
    @PutMapping("/profile")
    @Operation(summary = "Cập nhật profile", description = "Cập nhật thông tin cá nhân")
    public ResponseEntity<ResponseData<UserResponse>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        log.info("Cập nhật profile cho user ID: {}", userDetails.getUserId());
        UserResponse response = userService.updateProfile(userDetails.getUserId(), request);

        return ResponseEntity.ok(
                new ResponseData<>(200, "Cập nhật thông tin thành công", response)
        );
    }
}
