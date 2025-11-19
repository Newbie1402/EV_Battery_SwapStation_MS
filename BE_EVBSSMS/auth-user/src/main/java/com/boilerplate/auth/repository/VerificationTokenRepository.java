package com.boilerplate.auth.repository;

import com.boilerplate.auth.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository cho VerificationToken
 */
@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    /**
     * Tìm token theo chuỗi token
     */
    Optional<VerificationToken> findByToken(String token);

    /**
     * Tìm token hợp lệ của user (chưa sử dụng, chưa hết hạn)
     */
    @Query("SELECT vt FROM VerificationToken vt WHERE vt.user.id = :userId " +
           "AND vt.isUsed = false AND vt.expiresAt > :now")
    Optional<VerificationToken> findValidTokenByUserId(Long userId, LocalDateTime now);

    /**
     * Xóa các token đã hết hạn
     */
    @Modifying
    @Query("DELETE FROM VerificationToken vt WHERE vt.expiresAt < :now")
    void deleteExpiredTokens(LocalDateTime now);

    /**
     * Đánh dấu các token cũ của user là đã sử dụng
     */
    @Modifying
    @Query("UPDATE VerificationToken vt SET vt.isUsed = true WHERE vt.user.id = :userId AND vt.isUsed = false")
    void markOldTokensAsUsed(Long userId);
}

