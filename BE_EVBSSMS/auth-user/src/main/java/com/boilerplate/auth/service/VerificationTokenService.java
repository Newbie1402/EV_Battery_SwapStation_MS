package com.boilerplate.auth.service;

import com.boilerplate.auth.entity.User;
import com.boilerplate.auth.entity.VerificationToken;
import com.boilerplate.auth.enums.UserStatus;
import com.boilerplate.auth.exception.InvalidCredentialsException;
import com.boilerplate.auth.exception.ResourceNotFoundException;
import com.boilerplate.auth.repository.UserRepository;
import com.boilerplate.auth.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service xử lý token xác nhận đăng ký
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationTokenService {

    private final VerificationTokenRepository verificationTokenRepository;
    private final UserRepository userRepository;

    @Value("${app.verification-token-expiration-hours:48}")
    private int expirationHours;

    /**
     * Tạo token xác nhận cho user
     */
    @Transactional
    public VerificationToken createVerificationToken(User user) {
        // Đánh dấu các token cũ là đã sử dụng
        verificationTokenRepository.markOldTokensAsUsed(user.getId());

        // Tạo token mới
        String tokenString = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(expirationHours);

        VerificationToken token = VerificationToken.builder()
                .token(tokenString)
                .user(user)
                .expiresAt(expiresAt)
                .isUsed(false)
                .build();

        verificationTokenRepository.save(token);
        log.info("Đã tạo verification token cho user ID: {}, hết hạn lúc: {}", user.getId(), expiresAt);

        return token;
    }

    /**
     * Xác thực token và kích hoạt tài khoản
     */
    @Transactional
    public User verifyToken(String tokenString) {
        VerificationToken token = verificationTokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new ResourceNotFoundException("Token không tồn tại"));

        if (token.getIsUsed()) {
            throw new InvalidCredentialsException("Token đã được sử dụng");
        }

        if (token.isExpired()) {
            throw new InvalidCredentialsException("Token đã hết hạn. Vui lòng liên hệ admin để được hỗ trợ");
        }

        User user = token.getUser();

        if (user.getStatus() != UserStatus.PENDING_VERIFICATION) {
            throw new InvalidCredentialsException("Tài khoản đã được xác thực hoặc không trong trạng thái chờ xác thực");
        }

        // Cập nhật trạng thái user
        user.setStatus(UserStatus.ACTIVE);
        user.setIsVerified(true);
        userRepository.save(user);

        // Đánh dấu token đã sử dụng
        token.setIsUsed(true);
        token.setVerifiedAt(LocalDateTime.now());
        verificationTokenRepository.save(token);

        log.info("User ID: {} đã xác thực thành công và chuyển sang trạng thái ACTIVE", user.getId());

        return user;
    }

    /**
     * Kiểm tra token có hợp lệ không
     */
    @Transactional(readOnly = true)
    public boolean isTokenValid(String tokenString) {
        return verificationTokenRepository.findByToken(tokenString)
                .map(VerificationToken::isValid)
                .orElse(false);
    }

    /**
     * Xóa các token đã hết hạn (chạy định kỳ mỗi ngày)
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Bắt đầu xóa các verification token đã hết hạn");
        verificationTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Đã xóa xong các verification token hết hạn");
    }
}

