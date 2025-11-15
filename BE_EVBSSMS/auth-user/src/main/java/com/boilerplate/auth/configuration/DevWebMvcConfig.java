package com.boilerplate.auth.configuration;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Cấu hình Web MVC cho dev mode
 * ⚠️ ĐÃ TẮT DevMockUserInterceptor vì lý do bảo mật!
 */
@Configuration
@Profile("DISABLED")  // TẮT HOÀN TOÀN
@RequiredArgsConstructor
public class DevWebMvcConfig implements WebMvcConfigurer {

    // DevMockUserInterceptor đã bị tắt
    // private final DevMockUserInterceptor devMockUserInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Không đăng ký interceptor nào nữa
    }
}

