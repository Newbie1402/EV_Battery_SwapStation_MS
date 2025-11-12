package com.boilerplate.auth.repository;

import com.boilerplate.auth.enums.OtpType;
import com.boilerplate.auth.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository quản lý thao tác với OtpToken entity
 */
@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    /**
     * Tìm OTP hợp lệ (chưa dùng, chưa hết hạn) theo email và mã OTP
     */
    @Query("SELECT o FROM OtpToken o WHERE o.email = :email AND o.otpCode = :otpCode " +
           "AND o.otpType = :otpType AND o.used = false AND o.expiresAt > :now")
    Optional<OtpToken> findValidOtp(@Param("email") String email,
                                     @Param("otpCode") String otpCode,
                                     @Param("otpType") OtpType otpType,
                                     @Param("now") LocalDateTime now);

    /**
     * Tìm OTP mới nhất theo email và loại
     */
    Optional<OtpToken> findFirstByEmailAndOtpTypeOrderByCreatedAtDesc(String email, OtpType otpType);

    /**
     * Xóa tất cả OTP cũ đã hết hạn
     */
    @Modifying
    @Query("DELETE FROM OtpToken o WHERE o.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);

    /**
     * Xóa tất cả OTP của một email
     */
    @Modifying
    @Query("DELETE FROM OtpToken o WHERE o.email = :email")
    void deleteByEmail(@Param("email") String email);
}
