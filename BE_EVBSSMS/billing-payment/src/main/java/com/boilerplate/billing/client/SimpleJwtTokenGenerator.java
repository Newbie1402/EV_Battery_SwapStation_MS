package com.boilerplate.billing.client;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Component tạo JWT token đơn giản
 */
@Slf4j
@Component
public class SimpleJwtTokenGenerator {

    @Value("${jwt.admin.secretkey}")
    private String secretKey;

    private SecretKey key;

    @PostConstruct
    public void init() {
        // Lấy từ application.properties
        String jwtSecret = secretKey;
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Tạo access token với username và role, thời gian hết hạn tùy ý (ms)
     */
    public String generateToken(String username, String role, long expirationMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        String token = Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key)
                .compact();

        return token;
    }

    /**
     * Tạo token 5 giây
     */
    public String generateToken5s(String username, String role) {
        return generateToken(username, role, 5000);
    }

    /**
     * Tạo token 1 phút
     */
    public String generateToken1Min(String username, String role) {
        return generateToken(username, role, 600000000);
    }
}
