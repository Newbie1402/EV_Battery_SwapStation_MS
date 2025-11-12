package com.boilerplate.auth.configuration;

import com.boilerplate.auth.enums.Role;
import com.boilerplate.auth.enums.UserStatus;
import com.boilerplate.auth.entity.User;
import com.boilerplate.auth.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor tự động inject mock user cho dev mode
 * Giúp test API mà không cần token
 */
@Component
@Profile("dev")
@Slf4j
public class DevMockUserInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Chỉ mock user nếu chưa có authentication
        if (SecurityContextHolder.getContext().getAuthentication() == null) {

            // Lấy userId từ query param hoặc header, nếu không có thì dùng default
            String userIdParam = request.getParameter("userId");
            Long userId = (userIdParam != null) ? Long.parseLong(userIdParam) : 1L;

            // Lấy role từ query param hoặc header, nếu không có thì dùng DRIVER
            String roleParam = request.getParameter("mockRole");
            Role role = (roleParam != null) ? Role.valueOf(roleParam.toUpperCase()) : Role.DRIVER;

            // Tạo mock User entity
            User mockUserEntity = User.builder()
                    .id(userId)
                    .email("dev-user-" + userId + "@test.com")
                    .fullName("Dev User " + userId)
                    .role(role)
                    .status(UserStatus.ACTIVE)
                    .isActive(true)
                    .isVerified(true)
                    .build();

            // Tạo CustomUserDetails với User entity
            CustomUserDetails mockUser = new CustomUserDetails(mockUserEntity);

            // Set vào SecurityContext
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.info("[DEV MODE] Mock user injected - userId: {}, role: {}, email: {}",
                     userId, role, mockUserEntity.getEmail());
        }

        return true;
    }
}
