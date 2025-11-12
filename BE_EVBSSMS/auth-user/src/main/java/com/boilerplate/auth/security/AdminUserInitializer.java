package com.boilerplate.auth.security;

import com.boilerplate.auth.enums.Role;
import com.boilerplate.auth.enums.UserStatus;
import com.boilerplate.auth.entity.User;
import com.boilerplate.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Tự động tạo tài khoản admin khi ứng dụng khởi động
 * Admin chỉ cần Gmail để đăng nhập qua OAuth2, không cần username/password
 */
@Configuration
public class AdminUserInitializer {
    private static final Logger logger = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UserRepository userRepository;
    private final Environment env;

    public AdminUserInitializer(UserRepository userRepository, Environment env) {
        this.userRepository = userRepository;
        this.env = env;
    }

    @Bean
    public CommandLineRunner initAdminUser() {
        return args -> {
            String adminEmail = env.getProperty("ADMIN_EMAIL");
            String adminFullName = env.getProperty("ADMIN_FULL_NAME", "System Administrator");
            String adminGoogleId = env.getProperty("ADMIN_GOOGLE_ID");

            if (adminEmail == null || adminEmail.trim().isEmpty()) {
                logger.warn("⚠️ ADMIN_EMAIL chưa được cấu hình trong file .env. Bỏ qua việc tạo tài khoản admin.");
                return;
            }

            Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);

            if (existingAdmin.isPresent()) {
                User admin = existingAdmin.get();
                logger.info("Tài khoản admin với email {} đã tồn tại.", adminEmail);

                // Kiểm tra và cập nhật role nếu cần
                boolean needUpdate = false;
                if (admin.getRole() != Role.ADMIN) {
                    admin.setRole(Role.ADMIN);
                    needUpdate = true;
                    logger.info("🔄 Đã cập nhật quyền ADMIN cho người dùng có email: {}", adminEmail);
                }

                // Cập nhật Google ID nếu có trong .env và chưa được set
                if (adminGoogleId != null && !adminGoogleId.trim().isEmpty()) {
                    if (admin.getGoogleId() == null || admin.getGoogleId().isEmpty()) {
                        admin.setGoogleId(adminGoogleId);
                        admin.setOauthId(adminGoogleId);
                        admin.setOauthProvider("GOOGLE");
                        needUpdate = true;
                        logger.info("Đã cập nhật Google ID cho admin: {}", adminEmail);
                    }
                }

                // Đảm bảo admin được verify và active
                if (!admin.getIsVerified()) {
                    admin.setIsVerified(true);
                    needUpdate = true;
                }
                if (!admin.getIsActive()) {
                    admin.setIsActive(true);
                    needUpdate = true;
                }

                // ⭐ QUAN TRỌNG: Đảm bảo admin có status = ACTIVE
                if (admin.getStatus() != UserStatus.ACTIVE) {
                    admin.setStatus(UserStatus.ACTIVE);
                    needUpdate = true;
                    logger.info("Đã cập nhật status = ACTIVE cho admin");
                }

                if (needUpdate) {
                    admin.setUpdatedAt(LocalDateTime.now());
                    userRepository.save(admin);
                    logger.info("Đã cập nhật thông tin admin");
                }
            } else {
                logger.info("Đang tạo tài khoản admin với email: {}", adminEmail);

                User.UserBuilder adminBuilder = User.builder()
                        .email(adminEmail)
                        .fullName(adminFullName)
                        .role(Role.ADMIN)
                        .isActive(true)
                        .isVerified(true)
                        .status(UserStatus.ACTIVE)
                        .oauthProvider("GOOGLE")
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now());

                // Thêm Google ID nếu có
                if (adminGoogleId != null && !adminGoogleId.trim().isEmpty()) {
                    adminBuilder.googleId(adminGoogleId)
                               .oauthId(adminGoogleId);
                    logger.info("📝 Đã thêm Google ID cho admin");
                }

                User adminUser = adminBuilder.build();
                userRepository.save(adminUser);

                logger.info("Tài khoản admin '{}' ({}) đã được tạo thành công với status = ACTIVE.", adminFullName, adminEmail);
                logger.info("Admin có thể đăng nhập bằng Google OAuth2 với email: {}", adminEmail);
                if (adminGoogleId == null || adminGoogleId.trim().isEmpty()) {
                    logger.info("ADMIN_GOOGLE_ID chưa được cấu hình. Admin sẽ được tự động liên kết với Google khi đăng nhập lần đầu.");
                }
            }
        };
    }
}
