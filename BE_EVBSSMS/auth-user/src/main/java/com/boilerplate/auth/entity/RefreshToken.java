package com.boilerplate.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity lưu trữ Refresh Token của người dùng
 * Refresh Token có hiệu lực dài hơn Access Token
 */
@Entity
@Table(name = "refresh_tokens", indexes = {
    @Index(name = "idx_token", columnList = "token"),
    @Index(name = "idx_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Refresh Token string
     */
    @Column(nullable = false, unique = true, length = 500)
    private String token;

    /**
     * Người dùng sở hữu token
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Thời gian hết hạn
     */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /**
     * Token đã bị thu hồi chưa
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean revoked = false;

    /**
     * Thời gian tạo
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Kiểm tra token đã hết hạn chưa
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    /**
     * Kiểm tra token có hợp lệ không
     */
    public boolean isValid() {
        return !revoked && !isExpired();
    }
}
