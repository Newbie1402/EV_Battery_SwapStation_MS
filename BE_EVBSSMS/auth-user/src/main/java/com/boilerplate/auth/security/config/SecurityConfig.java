package com.boilerplate.auth.security.config;

import com.boilerplate.auth.security.CustomUserDetailsService;
import com.boilerplate.auth.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
// Bỏ @Profile("!dev") - cho phép chạy trong TẤT CẢ profile
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Swagger UI & API Docs (Public)
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()

                        // Actuator endpoints (Public)
                        .requestMatchers("/actuator/**").permitAll()

                        // OAuth2 endpoints (Public)
                        .requestMatchers(
                                "/oauth2/**",
                                "/login/oauth2/**",
                                "/api/auth/oauth2/**"
                        ).permitAll()

                        // Auth endpoints (Public)
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/verify-otp",
                                "/api/auth/resend-otp",
                                "/api/auth/refresh-token",
                                "/api/auth/logout"
                        ).permitAll()

                        // Verification endpoints (Public)
                        .requestMatchers("/api/verification/**").permitAll()

                        // Admin endpoints (Chỉ ADMIN)
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Staff endpoints (STAFF hoặc ADMIN)
                        .requestMatchers("/api/staff/**").hasAnyRole("STAFF", "ADMIN")

                        // Driver endpoints (DRIVER hoặc ADMIN)
                        .requestMatchers("/api/driver/**").hasAnyRole("DRIVER", "ADMIN")

                        // User profile endpoints (Authenticated users)
                        .requestMatchers("/api/users/**").authenticated()

                        // Tất cả request khác cần authentication
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
