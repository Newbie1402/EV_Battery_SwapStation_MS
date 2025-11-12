package com.boilerplate.auth.entity;

import com.boilerplate.auth.enums.OtpType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity lưu trữ mã OTP để xác thực email
 * OTP có hiệu lực trong 5 phút
 */
@Entity
@Table(name = "otp_tokens", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_otp_code", columnList = "otp_code")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Email nhận OTP
     */
    @Column(nullable = false, length = 100)
    private String email;

    /**
     * Mã OTP (6 chữ số)
     */
    @Column(name = "otp_code", nullable = false, length = 6)
    private String otpCode;

    /**
     * Loại OTP (REGISTRATION hoặc PASSWORD_RESET)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OtpType otpType;

    /**
     * Thời gian hết hạn (5 phút sau khi tạo)
     */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /**
     * OTP đã được sử dụng chưa
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean used = false;

    /**
     * Thời gian tạo
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Kiểm tra OTP đã hết hạn chưa
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    /**
     * Kiểm tra OTP có hợp lệ không (chưa dùng và chưa hết hạn)
     */
    public boolean isValid() {
        return !used && !isExpired();
    }
}
