package com.boilerplate.auth.security;

import com.boilerplate.auth.enums.Role;
import com.boilerplate.auth.enums.UserStatus;
import com.boilerplate.auth.model.entity.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Cấu hình Security cho môi trường DEV
 * TẮT HOÀN TOÀN Security và tự động inject mock user
 *
 * Chỉ hoạt động khi chạy với profile "dev"
 */
@Configuration
@EnableWebSecurity
@Profile("dev")
@Slf4j
public class DevSecurityConfig {

    @Bean
    public SecurityFilterChain devSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()  // CHO PHÉP TẤT CẢ REQUEST - CHỈ DÙNG CHO DEV
                )
                .addFilterBefore(mockUserFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Filter tự động inject mock user vào SecurityContext
     */
    @Bean
    public OncePerRequestFilter mockUserFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                          HttpServletResponse response,
                                          FilterChain filterChain) throws ServletException, IOException {

                // Lấy userId từ query param, nếu không có thì dùng default
                String userIdParam = request.getParameter("userId");
                Long userId = (userIdParam != null && !userIdParam.isEmpty())
                        ? Long.parseLong(userIdParam) : 1L;

                // Lấy role từ query param, nếu không có thì dùng DRIVER
                String roleParam = request.getParameter("mockRole");
                Role role = (roleParam != null && !roleParam.isEmpty())
                        ? Role.valueOf(roleParam.toUpperCase()) : Role.DRIVER;

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

                // Tạo CustomUserDetails
                CustomUserDetails mockUser = new CustomUserDetails(mockUserEntity);

                // Set vào SecurityContext
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("🧪 [DEV MODE] Mock user injected - userId: {}, role: {}", userId, role);

                // Tiếp tục filter chain
                filterChain.doFilter(request, response);

                // Clear SecurityContext sau khi request xong
                SecurityContextHolder.clearContext();
            }
        };
    }
}
