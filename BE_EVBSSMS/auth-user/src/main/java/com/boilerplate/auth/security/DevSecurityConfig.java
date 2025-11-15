package com.boilerplate.auth.security;

import com.boilerplate.auth.enums.Role;
import com.boilerplate.auth.enums.UserStatus;
import com.boilerplate.auth.entity.User;
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
 * ⚠️⚠️⚠️ CẢNH BÁO BẢO MẬT - FILE NÀY ĐÃ BỊ TẮT ⚠️⚠️⚠️
 *
 * File này đang TẮT HOÀN TOÀN Security và tự động inject mock user!
 * Đây là LỖ HỔNG BẢO MẬT NGHIÊM TRỌNG!
 *
 * ĐÃ TẮT bằng cách đổi @Profile("dev") thành @Profile("DISABLED")
 *
 * Vui lòng ĐĂNG NHẬP BÌNH THƯỜNG qua /api/auth/login
 */
@Configuration
@EnableWebSecurity
@Profile("DISABLED")  // ⚠️ TẮT HOÀN TOÀN - KHÔNG CHẠY TRONG BẤT KỲ PROFILE NÀO
@Slf4j
public class DevSecurityConfig {

    @Bean
    public SecurityFilterChain devSecurityFilterChain(HttpSecurity http) throws Exception {
        // ĐÃ TẮT - không sử dụng config này nữa
        log.error("⚠️⚠️⚠️ DevSecurityConfig ĐÃ BỊ TẮT! Nếu bạn thấy log này, có gì đó sai!");
        throw new IllegalStateException("DevSecurityConfig đã bị tắt và không nên được load!");
    }

    @Bean
    public OncePerRequestFilter mockUserFilter() {
        // ĐÃ TẮT - không inject mock user nữa
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                          HttpServletResponse response,
                                          FilterChain filterChain) throws ServletException, IOException {
                log.error("⚠️ MockUserFilter ĐÃ BỊ TẮT nhưng vẫn được gọi! Có lỗi nghiêm trọng!");
                filterChain.doFilter(request, response);
            }
        };
    }
}
