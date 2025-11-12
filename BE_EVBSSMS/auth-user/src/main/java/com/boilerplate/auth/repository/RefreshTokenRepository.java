package com.boilerplate.auth.repository;

import com.boilerplate.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository quản lý thao tác với RefreshToken entity
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /**
     * Tìm refresh token theo token string
     */
    Optional<RefreshToken> findByToken(String token);

    /**
     * Tìm tất cả refresh token của một người dùng
     */
    List<RefreshToken> findByUserId(Long userId);

    /**
     * Tìm refresh token hợp lệ (chưa thu hồi, chưa hết hạn)
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.token = :token " +
           "AND rt.revoked = false AND rt.expiresAt > :now")
    Optional<RefreshToken> findValidToken(@Param("token") String token,
                                           @Param("now") LocalDateTime now);

    /**
     * Thu hồi tất cả token của một người dùng
     */
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.user.id = :userId")
    void revokeAllUserTokens(@Param("userId") Long userId);

    /**
     * Xóa tất cả token đã hết hạn
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);

    /**
     * Xóa tất cả token của một người dùng
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
