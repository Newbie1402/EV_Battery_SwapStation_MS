package com.boilerplate.auth.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter xác thực JWT cho mỗi request
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        log.debug("Processing authentication for: {}", requestURI);

        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                log.debug("JWT token found, validating...");

                if (tokenProvider.validateToken(jwt)) {
                    log.debug("JWT token is valid");
                    String username = tokenProvider.getUsernameFromToken(jwt);
                    log.debug("Username from token: {}", username);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    log.debug("User loaded: {}, authorities: {}", username, userDetails.getAuthorities());

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("Authentication set in SecurityContext for user: {}", username);
                } else {
                    log.warn("JWT token validation failed for request: {}", requestURI);
                }
            } else {
                log.debug("No JWT token found in request to: {}", requestURI);
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context for request: {}", requestURI, ex);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Lấy JWT token từ header Authorization
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken)) {
            // Trim toàn bộ string trước
            bearerToken = bearerToken.trim();

            if (bearerToken.startsWith("Bearer ")) {
                // Extract token và trim lại để loại bỏ khoảng trắng thừa
                String token = bearerToken.substring(7).trim();

                // Validate token không chứa khoảng trắng
                if (token.contains(" ")) {
                    log.warn("JWT token contains whitespace characters");
                    return null;
                }

                return token;
            }
        }

        return null;
    }
}

