package com.boilerplate.auth.repository;

import com.boilerplate.auth.enums.Role;
import com.boilerplate.auth.enums.UserStatus;
import com.boilerplate.auth.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository quản lý thao tác với User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Tìm người dùng theo email
     */
    Optional<User> findByEmail(String email);

    /**
     * Tìm người dùng theo Google ID
     */
    Optional<User> findByGoogleId(String googleId);

    /**
     * Tìm người dùng theo số điện thoại
     */
    Optional<User> findByPhone(String phone);

    /**
     * Tìm người dùng theo số CMND/CCCD
     */
    Optional<User> findByIdentityCard(String identityCard);

    /**
     * Kiểm tra email đã tồn tại chưa
     */
    boolean existsByEmail(String email);

    /**
     * Kiểm tra Google ID đã tồn tại chưa
     */
    boolean existsByGoogleId(String googleId);

    /**
     * Tìm người dùng theo OAuth ID và Provider
     */
    Optional<User> findByOauthIdAndOauthProvider(String oauthId, String oauthProvider);

    /**
     * Kiểm tra OAuth ID và Provider đã tồn tại chưa
     */
    boolean existsByOauthIdAndOauthProvider(String oauthId, String oauthProvider);

    /**
     * Kiểm tra số CMND/CCCD đã tồn tại chưa
     */
    boolean existsByIdentityCard(String identityCard);

    /**
     * Tìm tất cả người dùng theo vai trò
     */
    List<User> findByRole(Role role);

    /**
     * Tìm tất cả người dùng theo trạng thái
     */
    List<User> findByStatus(UserStatus status);

    /**
     * Tìm tất cả người dùng theo vai trò và trạng thái
     */
    List<User> findByRoleAndStatus(Role role, UserStatus status);

    /**
     * Đếm số lượng người dùng theo vai trò
     */
    long countByRole(Role role);

    /**
     * Tìm kiếm người dùng theo tên (LIKE)
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<User> searchByFullName(@Param("name") String name);

    /**
     * Tìm tất cả người dùng chờ phê duyệt
     */
    List<User> findByStatusOrderByCreatedAtDesc(UserStatus status);

    /**
     * Tìm tất cả người dùng chờ phê duyệt theo role
     */
    List<User> findByStatusAndRoleOrderByCreatedAtDesc(UserStatus status, Role role);

    /**
     * Đếm số lượng đơn đăng ký chờ duyệt
     */
    long countByStatus(UserStatus status);
}
