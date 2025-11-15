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
 * ⚠️ CẢNH BÁO: Đã TẮT vì lý do bảo mật!
 * Interceptor này bypass hoàn toàn authentication, rất nguy hiểm!
 *
 * KHÔNG SỬ DỤNG trong môi trường DEV nữa!
 * Thay vào đó, hãy đăng nhập bình thường qua /api/auth/login
 */
@Component
@Profile("DISABLED")  // TẮT HOÀN TOÀN - không chạy trong bất kỳ profile nào
@Slf4j
public class DevMockUserInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // ĐÃ TẮT - không mock user nữa
        log.warn("⚠️ DevMockUserInterceptor đã được TẮT vì lý do bảo mật!");
        return true;
    }
}
