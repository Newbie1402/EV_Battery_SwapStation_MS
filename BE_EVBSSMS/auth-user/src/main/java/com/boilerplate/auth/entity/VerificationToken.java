package com.boilerplate.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity lưu trữ token xác nhận đăng ký
 * Token có hiệu lực 2 ngày sau khi admin phê duyệt
 */
@Entity
@Table(name = "verification_tokens", indexes = {
    @Index(name = "idx_token", columnList = "token"),
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_expires_at", columnList = "expires_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Token xác nhận (UUID)
     */
    @Column(nullable = false, unique = true, length = 100)
    private String token;

    /**
     * Người dùng liên kết với token
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Thời gian hết hạn (2 ngày kể từ lúc tạo)
     */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /**
     * Token đã được sử dụng chưa
     */
    @Column(name = "is_used", nullable = false)
    @Builder.Default
    private Boolean isUsed = false;

    /**
     * Thời gian tạo token
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Thời gian xác nhận (khi user click vào link)
     */
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    /**
     * Kiểm tra token có hết hạn chưa
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    /**
     * Kiểm tra token có hợp lệ không (chưa sử dụng và chưa hết hạn)
     */
    public boolean isValid() {
        return !isUsed && !isExpired();
    }
}

