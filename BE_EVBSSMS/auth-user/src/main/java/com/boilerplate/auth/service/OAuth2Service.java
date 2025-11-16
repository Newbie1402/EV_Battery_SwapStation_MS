package com.boilerplate.auth.service;

import com.boilerplate.auth.enums.Role;
import com.boilerplate.auth.enums.UserStatus;
import com.boilerplate.auth.exception.DuplicateResourceException;
import com.boilerplate.auth.exception.InvalidCredentialsException;
import com.boilerplate.auth.model.request.AddVehicleRequest;
import com.boilerplate.auth.model.dto.request.OAuth2LoginRequest;
import com.boilerplate.auth.model.dto.request.OAuth2RegisterRequest;
import com.boilerplate.auth.model.dto.response.AuthResponse;
import com.boilerplate.auth.model.dto.response.OAuth2UserInfo;
import com.boilerplate.auth.model.dto.response.UserResponse;
import com.boilerplate.auth.entity.RefreshToken;
import com.boilerplate.auth.entity.User;
import com.boilerplate.auth.entity.Vehicle;
import com.boilerplate.auth.model.event.EmailEvent;
import com.boilerplate.auth.repository.RefreshTokenRepository;
import com.boilerplate.auth.repository.UserRepository;
import com.boilerplate.auth.repository.VehicleRepository;
import com.boilerplate.auth.security.jwt.JwtTokenProvider;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;

/**
 * Service xử lý xác thực OAuth2 với Google
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2Service {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider tokenProvider;
    private final KafkaProducerService kafkaProducerService;
    private final EmailService emailService;
    private final EmployeeIdService employeeIdService;

    @Value("${GOOGLE_CLIENT_ID:}")
    private String googleClientId;

    /**
     * Xác thực Google ID Token và trả về thông tin người dùng
     */
    public OAuth2UserInfo verifyGoogleToken(String idToken) {
        try {
            // Kiểm tra xem GOOGLE_CLIENT_ID đã được load chưa
            if (googleClientId == null || googleClientId.isEmpty()) {
                log.error("GOOGLE_CLIENT_ID chưa được cấu hình!");
                throw new InvalidCredentialsException("Cấu hình OAuth2 chưa đầy đủ");
            }

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken token = verifier.verify(idToken);
            if (token != null) {
                GoogleIdToken.Payload payload = token.getPayload();

                return OAuth2UserInfo.builder()
                        .googleId(payload.getSubject())
                        .email(payload.getEmail())
                        .name((String) payload.get("name"))
                        .fullName((String) payload.get("name"))
                        .picture((String) payload.get("picture"))
                        .avatar((String) payload.get("picture"))
                        .emailVerified(payload.getEmailVerified())
                        .build();
            } else {
                throw new InvalidCredentialsException("Google ID Token không hợp lệ");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xác thực Google token: {}", e.getMessage());
            throw new InvalidCredentialsException("Không thể xác thực với Google: " + e.getMessage());
        }
    }

    /**
     * Đăng nhập bằng Google OAuth2
     */
    @Transactional
    public AuthResponse loginWithGoogle(OAuth2LoginRequest request) {
        // Xác thực Google ID Token
        OAuth2UserInfo googleUser = verifyGoogleToken(request.getIdToken());

        // Tìm user trong database theo Google ID hoặc email
        User user = userRepository.findByOauthIdAndOauthProvider(googleUser.getGoogleId(), "GOOGLE")
                .orElseGet(() -> userRepository.findByEmail(googleUser.getEmail())
                        .orElse(null));

        if (user == null) {
            // User chưa tồn tại, yêu cầu đăng ký
            return AuthResponse.builder()
                    .statusCode(404)
                    .message("Tài khoản Google chưa được đăng ký. Vui lòng đăng ký trước khi đăng nhập.")
                    .data(googleUser)
                    .build();
        }

        // Kiểm tra tài khoản có bị khóa không
        if (!user.getIsActive()) {
            throw new InvalidCredentialsException("Tài khoản đã bị khóa");
        }

        // Cập nhật OAuth info nếu chưa có (trường hợp admin được tạo trước khi có Google ID)
        boolean needUpdate = false;
        if (user.getOauthId() == null || user.getOauthId().isEmpty()) {
            user.setOauthId(googleUser.getGoogleId());
            needUpdate = true;
            log.info("🔄 Cập nhật Google ID cho user: {}", user.getEmail());
        }
        if (user.getOauthProvider() == null || user.getOauthProvider().isEmpty()) {
            user.setOauthProvider("GOOGLE");
            needUpdate = true;
        }
        if (!user.getIsVerified()) {
            user.setIsVerified(true); // Google đã xác thực email
            needUpdate = true;
        }
        if (user.getGoogleId() == null || user.getGoogleId().isEmpty()) {
            user.setGoogleId(googleUser.getGoogleId());
            needUpdate = true;
        }
        if (user.getAvatar() == null || user.getAvatar().isEmpty()) {
            user.setAvatar(googleUser.getAvatar());
            needUpdate = true;
        }

        // Nếu là admin thì set status = ACTIVE
        if (user.getRole() == Role.ADMIN && user.getStatus() != UserStatus.ACTIVE) {
            user.setStatus(UserStatus.ACTIVE);
            needUpdate = true;
            log.info("Đã set status = ACTIVE cho admin: {}", user.getEmail());
        }
        if (needUpdate) {
            user = userRepository.save(user);
            // nếu cần, gán employeeId cho user (trường hợp admin được tạo trước nhưng bây giờ có role DRIVER/STAFF)
            employeeIdService.assignIfEligible(user);
            log.info("Đã cập nhật thông tin OAuth2 cho user: {}", user.getEmail());
        }

        String accessToken = tokenProvider.generateAccessTokenWithUserInfo(
                user.getEmail(),
                "ROLE_" + user.getRole().name(),
                user.getFullName(),
                user.getEmail()
        );
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        // Lưu refresh token
        saveRefreshToken(user, refreshToken);

        log.info("User đăng nhập thành công qua Google: {} (Role: {})", user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .statusCode(200)
                .message("Đăng nhập thành công!")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    /**
     * Đăng ký tài khoản mới qua Google OAuth2
     * Backend tự động verify idToken và lấy thông tin từ Google
     */
    @Transactional
    public AuthResponse registerWithGoogle(OAuth2RegisterRequest request) {
        // Bước 1: Verify Google ID Token và lấy thông tin user từ Google
        OAuth2UserInfo googleUser = verifyGoogleToken(request.getIdToken());

        log.info("Đã xác thực Google token, googleId: {}, email: {}", googleUser.getGoogleId(), googleUser.getEmail());

        // Bước 2: Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(googleUser.getEmail())) {
            throw new DuplicateResourceException("Email " + googleUser.getEmail() + " đã được sử dụng");
        }

        // Bước 3: Kiểm tra identity card đã tồn tại chưa
        if (request.getIdentityCard() != null && !request.getIdentityCard().isEmpty() &&
            userRepository.existsByIdentityCard(request.getIdentityCard())) {
            throw new DuplicateResourceException("Số CMND/CCCD đã được sử dụng");
        }

        // Bước 4: Kiểm tra Google ID đã được sử dụng chưa
        if (userRepository.existsByGoogleId(googleUser.getGoogleId())) {
            throw new DuplicateResourceException("Tài khoản Google này đã được đăng ký");
        }

        // Bước 5: Tạo user mới với thông tin từ Google + thông tin từ request
        User user = User.builder()
                .email(googleUser.getEmail())  // Lấy từ Google
                .fullName(googleUser.getFullName())  // Lấy từ Google
                .avatar(googleUser.getAvatar())  // Lấy từ Google
                .googleId(googleUser.getGoogleId())  // Lấy từ Google
                .oauthId(googleUser.getGoogleId())  // Lấy từ Google
                .oauthProvider("GOOGLE")
                .isVerified(true)  // Google đã verify email
                .isActive(true)
                .phone(request.getPhone())  // Từ request
                .birthday(request.getBirthday())  // Từ request
                .role(request.getRole())  // Từ request
                .address(request.getAddress())  // Từ request
                .identityCard(request.getIdentityCard())  // Từ request
                .build();

        user = userRepository.save(user);
        // Gán employeeId nếu role phù hợp
        employeeIdService.assignIfEligible(user);
        log.info("Đã tạo tài khoản mới qua Google cho user: {}", user.getEmail());

        // Bước 6: Nếu là Driver, thêm phương tiện
        if (user.getRole() == Role.DRIVER && request.getVehicles() != null && !request.getVehicles().isEmpty()) {
            for (AddVehicleRequest vehicleRequest : request.getVehicles()) {
                // Kiểm tra VIN đã tồn tại chưa
                if (vehicleRepository.existsByVin(vehicleRequest.getVin())) {
                    throw new DuplicateResourceException("VIN " + vehicleRequest.getVin() + " đã được sử dụng");
                }

                // Kiểm tra biển số đã tồn tại chưa
                if (vehicleRepository.existsByLicensePlate(vehicleRequest.getLicensePlate())) {
                    throw new DuplicateResourceException("Biển số " + vehicleRequest.getLicensePlate() + " đã được sử dụng");
                }

                Vehicle vehicle = Vehicle.builder()
                        .vin(vehicleRequest.getVin())
                        .model(vehicleRequest.getModel())
                        .licensePlate(vehicleRequest.getLicensePlate())
                        .batteryType(vehicleRequest.getBatteryType())
                        .batteryCapacity(vehicleRequest.getBatteryCapacity())
                        .user(user)
                        .build();
                vehicleRepository.save(vehicle);
            }
            log.info("Đã thêm {} phương tiện cho driver: {}", request.getVehicles().size(), user.getEmail());
        }

        // Bước 7: Gửi email chào mừng qua Kafka
        String subject = "Chào mừng đến với EV Battery Swap Station";
        String body = emailService.buildWelcomeEmailBody(user.getFullName(), user.getRole().name());
        EmailEvent emailEvent = EmailEvent.builder()
                .to(user.getEmail())
                .subject(subject)
                .body(body)
                .build();
        kafkaProducerService.sendEmailEvent(emailEvent);

        // Bước 8: Tạo token
        String accessToken = tokenProvider.generateAccessToken(user.getEmail(), "ROLE_" + user.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        // Lưu refresh token
        saveRefreshToken(user, refreshToken);

        log.info("Đăng ký qua Google thành công cho user: {}", user.getEmail());

        return AuthResponse.builder()
                .statusCode(201)
                .message("Đăng ký thành công!")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    /**
     * Lưu refresh token vào database
     */
    private void saveRefreshToken(User user, String token) {
        // Xóa refresh token cũ của user
        refreshTokenRepository.deleteByUserId(user.getId());

        // Tạo refresh token mới
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7); // 7 ngày
        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .expiresAt(expiresAt)
                .build();

        refreshTokenRepository.save(refreshToken);
    }


    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .birthday(user.getBirthday())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .address(user.getAddress())
                .identityCard(user.getIdentityCard())
                .isVerified(user.getIsVerified())
                .isActive(user.getIsActive())
                .employeeId(user.getEmployeeId())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
