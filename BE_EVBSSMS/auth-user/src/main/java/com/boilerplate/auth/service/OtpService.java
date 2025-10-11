package com.boilerplate.auth.service;

import com.boilerplate.auth.enums.OtpType;
import com.boilerplate.auth.exception.InvalidOtpException;
import com.boilerplate.auth.model.entity.OtpToken;
import com.boilerplate.auth.model.entity.User;
import com.boilerplate.auth.model.event.EmailEvent;
import com.boilerplate.auth.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

/**
 * Service xử lý OTP
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;
    private final KafkaProducerService kafkaProducerService;
    private final EmailService emailService;

    @Value("${otp.expiration-minutes:5}")
    private int otpExpirationMinutes;

    @Value("${otp.length:6}")
    private int otpLength;

    /**
     * Tạo và gửi OTP
     */
    @Transactional
    public void createAndSendOtp(User user, OtpType otpType) {
        // Xóa tất cả OTP cũ của user theo email
        otpTokenRepository.deleteByEmail(user.getEmail());

        // Tạo OTP mới
        String otpCode = generateOtpCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpirationMinutes);

        OtpToken otpToken = OtpToken.builder()
                .email(user.getEmail())
                .otpCode(otpCode)
                .otpType(otpType)
                .expiresAt(expiresAt)
                .used(false)
                .build();

        otpTokenRepository.save(otpToken);

        // Gửi OTP qua email (sử dụng Kafka)
        String subject = otpType == OtpType.REGISTRATION
                ? "Mã OTP xác thực tài khoản"
                : "Mã OTP đặt lại mật khẩu";
        String body = emailService.buildOtpEmailBody(user.getFullName(), otpCode, otpType);

        EmailEvent emailEvent = EmailEvent.builder()
                .to(user.getEmail())
                .subject(subject)
                .body(body)
                .build();

        kafkaProducerService.sendEmailEvent(emailEvent);
        log.info("Đã tạo và gửi OTP cho user: {}", user.getEmail());
    }

    /**
     * Xác thực OTP
     */
    @Transactional
    public void verifyOtp(String email, String otpCode, OtpType otpType) {
        LocalDateTime now = LocalDateTime.now();
        OtpToken otpToken = otpTokenRepository.findValidOtp(email, otpCode, otpType, now)
                .orElseThrow(() -> new InvalidOtpException("Mã OTP không hợp lệ hoặc đã hết hạn"));

        // Đánh dấu OTP đã sử dụng
        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        log.info("Xác thực OTP thành công cho email: {}", email);
    }

    /**
     * Tạo mã OTP ngẫu nhiên
     */
    private String generateOtpCode() {
        Random random = new Random();
        int otp = random.nextInt((int) Math.pow(10, otpLength));
        return String.format("%0" + otpLength + "d", otp);
    }

    /**
     * Xóa các OTP đã hết hạn (có thể chạy theo lịch)
     */
    @Transactional
    public void cleanupExpiredOtps() {
        LocalDateTime now = LocalDateTime.now();
        otpTokenRepository.deleteExpiredTokens(now);
        log.info("Đã xóa các OTP hết hạn");
    }
}
