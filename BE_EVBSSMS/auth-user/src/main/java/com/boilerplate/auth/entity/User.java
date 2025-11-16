package com.boilerplate.auth.entity;

import com.boilerplate.auth.enums.Role;
import com.boilerplate.auth.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho người dùng trong hệ thống
 * Hỗ trợ đăng nhập OAuth2 Google (không cần username/password)
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_google_id", columnList = "google_id"),
    @Index(name = "idx_phone", columnList = "phone"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_oauth", columnList = "oauth_id, oauth_provider"),
    @Index(name = "idx_employee_id", columnList = "employee_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Google ID từ OAuth2 (dùng làm định danh duy nhất)
     */
    @Column(name = "google_id", unique = true, length = 100)
    private String googleId;

    /**
     * OAuth ID từ provider (Google, Facebook, etc.)
     */
    @Column(name = "oauth_id", length = 100)
    private String oauthId;

    /**
     * OAuth Provider (GOOGLE, FACEBOOK, etc.)
     */
    @Column(name = "oauth_provider", length = 20)
    private String oauthProvider;

    /**
     * Email người dùng (bắt buộc, unique) - dùng làm identifier chính
     */
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    /**
     * Số điện thoại
     */
    @Column(name = "phone", length = 20)
    private String phone;

    /**
     * Họ và tên đầy đủ
     */
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    /**
     * Ngày sinh
     */
    @Column(name = "birthday")
    private LocalDate birthday;

    /**
     * URL ảnh đại diện
     */
    @Column(name = "avatar", length = 500)
    private String avatar;

    /**
     * Vai trò người dùng (DRIVER, STAFF, ADMIN)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    /**
     * Địa chỉ
     */
    @Column(name = "address", length = 255)
    private String address;

    /**
     * Số CMND/CCCD
     */
    @Column(name = "identity_card", unique = true, length = 20)
    private String identityCard;

    /**
     * Email đã được xác thực chưa
     */
    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    /**
     * Tài khoản có đang hoạt động không
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;


    /**
     * Trạng thái tài khoản
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private UserStatus status = UserStatus.PENDING_APPROVAL;

    /**
     * Lý do từ chối (nếu status = REJECTED)
     */
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    /**
     * Mã nhân viên tự động sinh (EVD hoặc EVS + 6 chữ số, 4 chữ số cuối là ddMM)
     * Ví dụ: EVD120612 (prefix + 2random + ddMM)
     */
    @Column(name = "employee_id", unique = true, length = 20)
    private String employeeId;

    /**
     * Danh sách phương tiện của tài xế (chỉ áp dụng cho role DRIVER)
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Vehicle> vehicles = new ArrayList<>();

    /**
     * Refresh token của người dùng
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RefreshToken> refreshTokens = new ArrayList<>();

    /**
     * Thời gian tạo
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Thời gian cập nhật
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Phương thức helper để thêm phương tiện
     */
    public void addVehicle(Vehicle vehicle) {
        vehicles.add(vehicle);
        vehicle.setUser(this);
    }

    /**
     * Phương thức helper để xóa phương tiện
     */
    public void removeVehicle(Vehicle vehicle) {
        vehicles.remove(vehicle);
        vehicle.setUser(null);
    }
}
