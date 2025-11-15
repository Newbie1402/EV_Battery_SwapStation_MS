package com.boilerplate.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * Component xử lý validate JWT token tại API Gateway
 * Sử dụng cùng JWT secret với auth-user service để verify token
 */
@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private SecretKey key;

    /**
     * Khởi tạo secret key từ chuỗi secret
     */
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        log.info("JWT Token Provider đã được khởi tạo tại API Gateway");
        log.info("JWT Secret length: {} characters", jwtSecret.length());
        log.debug("JWT Secret (first 10 chars): {}", jwtSecret.substring(0, Math.min(10, jwtSecret.length())));
    }

    /**
     * Validate JWT token và trả về Claims
     * Throws JwtException nếu token không hợp lệ
     */
    public Claims validateToken(String token) throws JwtException {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            log.warn("JWT token đã hết hạn: {}", e.getMessage());
            throw e;
        } catch (JwtException e) {
            log.error("JWT token không hợp lệ: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Lấy username từ JWT token
     */
    public String getUsernameFromToken(String token) {
        Claims claims = validateToken(token);
        return claims.getSubject();
    }

    /**
     * Lấy roles từ JWT token
     */
    public String getRolesFromToken(String token) {
        Claims claims = validateToken(token);
        return claims.get("role", String.class);
    }
}

