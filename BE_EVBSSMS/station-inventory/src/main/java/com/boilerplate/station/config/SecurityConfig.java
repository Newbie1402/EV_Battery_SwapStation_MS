//package com.boilerplate.station.config;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.oauth2.jwt.JwtDecoder;
//import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
//import org.springframework.security.web.SecurityFilterChain;
//
//import javax.crypto.spec.SecretKeySpec;
//
//@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity(prePostEnabled = true)
//public class SecurityConfig {
//
//    @Value("${jwt.secret}")
//    private String jwtSecret;
//
//    private static final String[] PUBLIC_ENDPOINTS = {
//            "/swagger-ui/**",
//            "/v3/api-docs/**",
//            "/actuator/**",
//            "/api/stations/public/**"
//    };
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(csrf -> csrf.disable())
//                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
//                        .anyRequest().authenticated()
//                )
//                .oauth2ResourceServer(oauth2 -> oauth2
//                        .jwt(jwt -> jwt.decoder(jwtDecoder()))
//                );
//        return http.build();
//    }
//
//    @Bean
//    public JwtDecoder jwtDecoder() {
//        // The token from the user's example uses HS384 algorithm
//        SecretKeySpec secretKey = new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA384");
//        return NimbusJwtDecoder.withSecretKey(secretKey).build();
//    }
//}
