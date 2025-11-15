package com.boilerplate.gateway.filter;

import com.boilerplate.gateway.dto.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Filter toàn cục xử lý authorization dựa trên role
 * Kiểm tra quyền truy cập endpoint dựa trên role của user
 */
@Component
@Slf4j
public class RoleAuthorizationFilter implements GlobalFilter, Ordered {

    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    /**
     * Map định nghĩa các endpoint và roles được phép truy cập
     * Key: Pattern của endpoint
     * Value: Danh sách roles được phép
     */
    private final Map<String, List<String>> endpointRoles = new HashMap<>() {{
        // Admin endpoints - chỉ ADMIN
        put("/api/admin/**", Arrays.asList("ADMIN"));

        // Staff endpoints - STAFF và ADMIN
        put("/api/staff/**", Arrays.asList("BSS_STAFF", "ADMIN"));

        // Station management - STAFF và ADMIN
        put("/api/stations/manage/**", Arrays.asList("BSS_STAFF", "ADMIN"));
        put("/api/batteries/manage/**", Arrays.asList("BSS_STAFF", "ADMIN"));

        // Booking/Swap endpoints - DRIVER, STAFF, ADMIN
        put("/api/bookings/**", Arrays.asList("DRIVER", "BSS_STAFF", "ADMIN"));
        put("/api/swaps/**", Arrays.asList("DRIVER", "BSS_STAFF", "ADMIN"));

        // Payment endpoints - DRIVER và ADMIN
        put("/api/payments/**", Arrays.asList("DRIVER", "ADMIN"));
        put("/api/invoices/**", Arrays.asList("DRIVER", "ADMIN"));

        // Reports/Analytics - chỉ ADMIN
        put("/api/reports/**", Arrays.asList("ADMIN"));
        put("/api/analytics/**", Arrays.asList("ADMIN"));
    }};

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        String userRole = request.getHeaders().getFirst("X-User-Role");

        log.debug("Checking authorization for path: {} with role: {}", path, userRole);

        // Nếu không có role trong header (public endpoint hoặc chưa qua JwtAuthenticationFilter)
        if (userRole == null || userRole.isEmpty()) {
            log.debug("No role found in header, skipping authorization check for: {}", path);
            return chain.filter(exchange);
        }

        // Kiểm tra quyền truy cập
        for (Map.Entry<String, List<String>> entry : endpointRoles.entrySet()) {
            String pattern = entry.getKey();
            List<String> allowedRoles = entry.getValue();

            if (pathMatcher.match(pattern, path)) {
                log.debug("Path {} matches pattern {}. Required roles: {}", path, pattern, allowedRoles);

                // Kiểm tra role có trong danh sách cho phép không
                if (!allowedRoles.contains(userRole)) {
                    log.warn("Access denied for user with role {} to path {}", userRole, path);
                    return forbidden(exchange, "Bạn không có quyền truy cập tài nguyên này");
                }

                log.debug("Access granted for user with role {} to path {}", userRole, path);
                break;
            }
        }

        return chain.filter(exchange);
    }

    /**
     * Trả về response 403 Forbidden
     */
    private Mono<Void> forbidden(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.FORBIDDEN);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                403,
                message
        );

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(errorResponse);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (Exception e) {
            log.error("Error writing forbidden response: {}", e.getMessage());
            return response.setComplete();
        }
    }

    @Override
    public int getOrder() {
        return -99; // Chạy sau JwtAuthenticationFilter (-100)
    }
}
