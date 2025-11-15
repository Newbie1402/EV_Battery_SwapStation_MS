package com.boilerplate.gateway.filter;

import com.boilerplate.gateway.dto.ErrorResponse;
import com.boilerplate.gateway.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Filter toàn cục xử lý JWT authentication
 * Verify JWT token và inject thông tin user vào header cho downstream services
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtTokenProvider jwtTokenProvider;
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        log.debug("Processing request: {} {}", request.getMethod(), path);

        // Public endpoints
        if (isPublicPath(path)) {
            log.debug("Public path detected, skipping authentication: {}", path);
            return chain.filter(exchange);
        }

        // Extract JWT token
        String token = extractToken(request);
        if (token == null || token.isEmpty()) {
            log.warn("No token found in request to: {}", path);
            return unauthorized(exchange, "Token không tồn tại");
        }

        try {
            // Verify token signature và expiration
            Claims claims = jwtTokenProvider.validateToken(token);

            // Extract user info từ token
            String username = claims.getSubject();
            String role = claims.get("role", String.class);
            String fullName = claims.get("fullName", String.class);
            String email = claims.get("email", String.class);

            // Inject thông tin vào header cho downstream services
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-User-Name", username != null ? username : "")
                    .header("X-User-Role", role != null ? role : "")
                    .header("X-User-FullName", fullName != null ? fullName : "")
                    .header("X-User-Email", email != null ? email : "")
                    .build();

            log.info("Authenticated user: {} - Role: {}", username, role);

            return chain.filter(exchange.mutate().request(modifiedRequest).build());

        } catch (ExpiredJwtException e) {
            log.warn("Expired token for path: {}", path);
            return unauthorized(exchange, "Token đã hết hạn");
        } catch (JwtException e) {
            log.error("Invalid token for path: {}, error: {}", path, e.getMessage());
            return unauthorized(exchange, "Token không hợp lệ");
        } catch (Exception e) {
            log.error("Unexpected error during authentication: {}", e.getMessage(), e);
            return unauthorized(exchange, "Lỗi xác thực");
        }
    }

    /**
     * Kiểm tra xem path có phải là public endpoint không
     */
    private boolean isPublicPath(String path) {
        List<String> publicPaths = Arrays.asList(
                "/oauth2/login",
                "/oauth2/callback",
                "/api/auth/oauth2/google/register",
                "/api/auth/oauth2/google/login",
                "/api/auth/verify-otp",
                "/api/auth/resend-otp",
                "/api/auth/refresh-token",
                "/api/stations/public",
                "/swagger-ui",
                "/v3/api-docs",
                "/webjars",
                "/actuator/health"
        );

        return publicPaths.stream().anyMatch(path::contains);
    }

    /**
     * Extract JWT token từ Authorization header
     */
    private String extractToken(ServerHttpRequest request) {
        String bearerToken = request.getHeaders().getFirst("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    /**
     * Trả về response 401 Unauthorized
     */
    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                401,
                message
        );

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(errorResponse);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (Exception e) {
            log.error("Error writing unauthorized response: {}", e.getMessage());
            return response.setComplete();
        }
    }

    @Override
    public int getOrder() {
        return -100; // Chạy trước các filter khác
    }
}
