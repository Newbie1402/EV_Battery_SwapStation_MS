package com.boilerplate.auth.service;

import com.boilerplate.auth.enums.OtpType;
import com.boilerplate.auth.enums.Role;
import com.boilerplate.auth.enums.UserStatus;
import com.boilerplate.auth.exception.DuplicateResourceException;
import com.boilerplate.auth.exception.InvalidCredentialsException;
import com.boilerplate.auth.exception.ResourceNotFoundException;
import com.boilerplate.auth.model.dto.request.*;
import com.boilerplate.auth.model.dto.response.AuthResponse;
import com.boilerplate.auth.model.dto.response.OAuth2UserInfo;
import com.boilerplate.auth.model.dto.response.UserResponse;
import com.boilerplate.auth.model.dto.response.VehicleResponse;
import com.boilerplate.auth.entity.RefreshToken;
import com.boilerplate.auth.entity.User;
import com.boilerplate.auth.entity.Vehicle;
import com.boilerplate.auth.model.event.EmailEvent;
import com.boilerplate.auth.model.request.AddVehicleRequest;
import com.boilerplate.auth.repository.RefreshTokenRepository;
import com.boilerplate.auth.repository.UserRepository;
import com.boilerplate.auth.repository.VehicleRepository;
import com.boilerplate.auth.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý xác thực và quản lý người dùng
 * Luồng: Đăng ký → Chờ Admin duyệt → OTP → Đăng nhập
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider tokenProvider;
    private final OtpService otpService;
    private final OAuth2Service oauth2Service;
    private final KafkaProducerService kafkaProducerService;
    private final EmailService emailService;
    private final EmployeeIdService employeeIdService;
    private final VerificationTokenService verificationTokenService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * Đăng ký tài khoản mới qua Google OAuth2
     * Backend tự động verify idToken và lấy thông tin từ Google
     */
    @Transactional
    public AuthResponse registerWithGoogle(OAuth2RegisterRequest request) {
        // Bước 1: Verify Google ID Token và lấy thông tin user từ Google
        OAuth2UserInfo googleUser = oauth2Service.verifyGoogleToken(request.getIdToken());

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

        // Bước 5: Tạo user mới với thông tin từ Google + thông tin bổ sung từ request
        User user = User.builder()
                .email(googleUser.getEmail())
                .fullName(googleUser.getFullName())
                .avatar(googleUser.getAvatar())
                .googleId(googleUser.getGoogleId())
                .oauthId(googleUser.getGoogleId())
                .oauthProvider("GOOGLE")
                .isVerified(true)
                .isActive(false)
                .phone(request.getPhone())
                .birthday(request.getBirthday())
                .role(request.getRole())
                .address(request.getAddress())
                .identityCard(request.getIdentityCard())
                .status(UserStatus.PENDING_APPROVAL)
                .build();

        user = userRepository.save(user);

        // Gán employeeId nếu role phù hợp
        employeeIdService.assignIfEligible(user);

        log.info("Đã tạo tài khoản mới qua Google: email={}, role={}, status=PENDING_APPROVAL",
                user.getEmail(), user.getRole());

        // Bước 6: Nếu là Driver, thêm phương tiện (nếu có)
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

        // Bước 7: Gửi email thông báo đơn đã được tạo, chờ admin duyệt
        String subject = "Đơn đăng ký của bạn đang được xử lý";
        String body = emailService.buildRegistrationPendingEmailBody(user.getFullName(), user.getRole().name());
        EmailEvent emailEvent = EmailEvent.builder()
                .to(user.getEmail())
                .subject(subject)
                .body(body)
                .build();
        kafkaProducerService.sendEmailEvent(emailEvent);

        log.info("Đăng ký qua Google thành công, chờ admin duyệt: email={}", user.getEmail());

        // Trả về response với thông báo chờ duyệt
        return AuthResponse.builder()
                .statusCode(201)
                .message("Đăng ký thành công! Đơn của bạn đang chờ Admin phê duyệt. Bạn sẽ nhận được email khi đơn được duyệt.")
                .user(this.mapToUserResponse(user))
                .build();
    }

    /**
     * Admin phê duyệt hoặc từ chối đơn đăng ký
     */
    @Transactional
    public AuthResponse approveRegistration(ApproveRegistrationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (user.getStatus() != UserStatus.PENDING_APPROVAL) {
            throw new IllegalArgumentException("Đơn đăng ký đã được xử lý trước đó");
        }

        if (request.getApproved()) {
            // APPROVE - Chuyển sang PENDING_VERIFICATION và tạo token xác nhận
            user.setStatus(UserStatus.PENDING_VERIFICATION);
            userRepository.save(user);

            // Tạo verification token có hiệu lực 2 ngày
            var verificationToken = verificationTokenService.createVerificationToken(user);

            // Gửi email với link xác nhận
            sendApprovalEmailWithVerificationLink(user, verificationToken.getToken());

            log.info("Admin đã phê duyệt đơn đăng ký của user: {}", user.getEmail());

            return AuthResponse.builder()
                    .statusCode(200)
                    .message("Đã phê duyệt đơn đăng ký thành công. Email xác nhận đã được gửi đến người dùng.")
                    .user(mapToUserResponse(user))
                    .build();
        } else {
            // REJECT - Từ chối đơn đăng ký
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new IllegalArgumentException("Vui lòng cung cấp lý do từ chối");
            }

            user.setStatus(UserStatus.REJECTED);
            user.setRejectionReason(request.getRejectionReason());
            userRepository.save(user);

            // Gửi email thông báo bị từ chối
            sendRejectionEmailToUser(user);

            log.info("Admin đã từ chối đơn đăng ký của user: {}, lý do: {}", user.getEmail(), request.getRejectionReason());

            return AuthResponse.builder()
                    .statusCode(200)
                    .message("Đã từ chối đơn đăng ký và gửi thông báo đến người dùng.")
                    .user(mapToUserResponse(user))
                    .build();
        }
    }

    /**
     * Lấy danh sách đơn đăng ký chờ duyệt
     */
    public List<UserResponse> getPendingRegistrations(Role role) {
        List<User> users;
        if (role != null) {
            users = userRepository.findByStatusAndRoleOrderByCreatedAtDesc(UserStatus.PENDING_APPROVAL, role);
        } else {
            users = userRepository.findByStatusOrderByCreatedAtDesc(UserStatus.PENDING_APPROVAL);
        }

        return users.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Đếm số lượng đơn đăng ký chờ duyệt
     */
    public long countPendingRegistrations() {
        return userRepository.countByStatus(UserStatus.PENDING_APPROVAL);
    }

    /**
     * Xác thực OTP sau khi admin approve
     */
    @Deprecated
    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        // Xác thực OTP
        otpService.verifyOtp(request.getEmail(), request.getOtpCode(), OtpType.REGISTRATION);

        // Lấy thông tin user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        // Kiểm tra trạng thái
        if (user.getStatus() != UserStatus.PENDING_VERIFICATION) {
            throw new IllegalArgumentException("Tài khoản chưa được admin phê duyệt hoặc đã được xác thực");
        }

        // Đánh dấu tài khoản đã xác thực và kích hoạt
        user.setStatus(UserStatus.ACTIVE);
        user.setIsActive(true);
        userRepository.save(user);

        // Gửi email chào mừng
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getFullName(), user.getRole().name());
        } catch (Exception e) {
            log.error("Lỗi khi gửi welcome email đến: {}", user.getEmail(), e);
            // Không throw exception, email chỉ là thông báo phụ
        }

        // Tạo token
        String accessToken = tokenProvider.generateAccessToken(user.getEmail(), "ROLE_" + user.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        // Lưu refresh token
        saveRefreshToken(user, refreshToken);

        log.info("Xác thực OTP thành công và kích hoạt tài khoản cho user: {} (Role: {})", user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .statusCode(200)
                .message("Xác thực thành công! Chào mừng bạn đến với hệ thống.")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    /**
     * Đăng nhập bằng Google OAuth2
     */
    @Transactional
    public AuthResponse loginWithGoogle(OAuth2LoginRequest request) {
        // Xác thực Google ID Token
        OAuth2UserInfo googleUserInfo = oauth2Service.verifyGoogleToken(request.getIdToken());

        // Tìm user theo Google ID
        User user = userRepository.findByGoogleId(googleUserInfo.getGoogleId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tài khoản Google chưa được đăng ký. Vui lòng đăng ký trước khi đăng nhập."));

        // Kiểm tra trạng thái tài khoản
        if (user.getStatus() == UserStatus.PENDING_APPROVAL) {
            throw new InvalidCredentialsException("Đơn đăng ký của bạn đang chờ Admin phê duyệt. Vui lòng kiên nhẫn chờ đợi.");
        }

        if (user.getStatus() == UserStatus.REJECTED) {
            throw new InvalidCredentialsException("Đơn đăng ký của bạn đã bị từ chối. Lý do: " + user.getRejectionReason());
        }

        if (user.getStatus() == UserStatus.PENDING_VERIFICATION) {
            throw new InvalidCredentialsException("Tài khoản chưa được xác thực OTP. Vui lòng kiểm tra email để lấy mã OTP.");
        }

        if (user.getStatus() == UserStatus.INACTIVE || user.getStatus() == UserStatus.BANNED) {
            throw new InvalidCredentialsException("Tài khoản đã bị khóa");
        }

        // Cập nhật thông tin từ Google (avatar có thể thay đổi)
        user.setAvatar(googleUserInfo.getAvatar());
        userRepository.save(user);

        // Tạo token
        String accessToken = tokenProvider.generateAccessToken(user.getEmail(), "ROLE_" + user.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        // Lưu refresh token
        saveRefreshToken(user, refreshToken);

        log.info("User đăng nhập thành công: {}", user.getEmail());

        return AuthResponse.builder()
                .statusCode(200)
                .message("Đăng nhập thành công!")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    /**
     * Làm mới access token
     */
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshTokenValue = request.getRefreshToken();

        // Validate refresh token
        if (!tokenProvider.validateToken(refreshTokenValue)) {
            throw new InvalidCredentialsException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        // Lấy email từ token
        String email = tokenProvider.getUsernameFromToken(refreshTokenValue);

        // Kiểm tra refresh token có trong database không
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new InvalidCredentialsException("Refresh token không tồn tại"));

        // Kiểm tra refresh token đã hết hạn chưa
        if (!refreshToken.isValid()) {
            refreshTokenRepository.delete(refreshToken);
            throw new InvalidCredentialsException("Refresh token đã hết hạn. Vui lòng đăng nhập lại.");
        }

        // Lấy thông tin user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        // Tạo access token mới
        String newAccessToken = tokenProvider.generateAccessToken(email, "ROLE_" + user.getRole().name());

        log.info("Làm mới access token cho user: {}", email);

        return AuthResponse.builder()
                .statusCode(200)
                .message("Làm mới token thành công!")
                .accessToken(newAccessToken)
                .refreshToken(refreshTokenValue)
                .user(mapToUserResponse(user))
                .build();
    }

    /**
     * Gửi lại OTP
     */
    @Deprecated
    @Transactional
    public void resendOtp(ResendOtpRequest request) {
        log.warn("Deprecated API resendOtp được gọi cho email: {}", request.getEmail());
        throw new IllegalArgumentException("Tính năng OTP đã được thay thế bằng email xác nhận. " +
                "Vui lòng kiểm tra email hoặc liên hệ admin nếu cần hỗ trợ.");
    }

    /**
     * Đăng xuất - thu hồi refresh token
     */
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                    log.info("Đã thu hồi refresh token cho user ID: {}", token.getUser().getId());
                });
    }

    /**
     * Thêm phương tiện cho user
     */
    private void addVehicleForUser(User user, AddVehicleRequest vehicleRequest) {
        // Kiểm tra VIN đã tồn tại
        if (vehicleRepository.existsByVin(vehicleRequest.getVin())) {
            throw new DuplicateResourceException("VIN đã được sử dụng");
        }

        // Kiểm tra biển số đã tồn tại
        if (vehicleRepository.existsByLicensePlate(vehicleRequest.getLicensePlate())) {
            throw new DuplicateResourceException("Biển số xe đã được sử dụng");
        }

        Vehicle vehicle = Vehicle.builder()
                .vin(vehicleRequest.getVin())
                .model(vehicleRequest.getModel())
                .licensePlate(vehicleRequest.getLicensePlate())
                .batteryType(vehicleRequest.getBatteryType())
                .batteryCapacity(vehicleRequest.getBatteryCapacity())
                .notes(vehicleRequest.getNotes())
                .user(user)
                .build();

        vehicleRepository.save(vehicle);
        log.info("Đã thêm phương tiện cho driver: {}", user.getEmail());
    }

    /**
     * Gửi email chào mừng
     */
    private void sendWelcomeEmail(User user) {
        String subject = "Chào mừng đến với EV Battery Swap Station";
        String body = emailService.buildWelcomeEmailBody(user.getFullName(), user.getRole().name());
        EmailEvent emailEvent = EmailEvent.builder()
                .to(user.getEmail())
                .subject(subject)
                .body(body)
                .build();
        kafkaProducerService.sendEmailEvent(emailEvent);
    }

    /**
     * Lưu refresh token vào database
     */
    private void saveRefreshToken(User user, String token) {
        // Xóa refresh token cũ của user (nếu có)
        refreshTokenRepository.revokeAllUserTokens(user.getId());

        // Tạo refresh token mới
        LocalDateTime expiryDate = LocalDateTime.now().plusDays(7); // 7 ngày
        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .expiresAt(expiryDate)
                .build();

        refreshTokenRepository.save(refreshToken);
    }

    /**
     * Map User entity sang UserResponse DTO
     */
    private UserResponse mapToUserResponse(User user) {
        // Lấy danh sách vehicles của user nếu có
        List<VehicleResponse> vehicles = null;
        if (user.getRole() == Role.DRIVER && user.getEmployeeId() != null) {
            vehicles = vehicleRepository.findByUserEmployeeId(user.getEmployeeId())
                    .stream()
                    .map(this::mapToVehicleResponse)
                    .collect(Collectors.toList());
        }

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
                .status(user.getStatus())
                .vehicles(vehicles)
                .employeeId(user.getEmployeeId())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    /**
     * Map Vehicle entity sang VehicleResponse DTO
     */
    private VehicleResponse mapToVehicleResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .vehicleId(vehicle.getVehicleId())
                .vin(vehicle.getVin())
                .model(vehicle.getModel())
                .licensePlate(vehicle.getLicensePlate())
                .batteryType(vehicle.getBatteryType())
                .batteryCapacity(vehicle.getBatteryCapacity())
                .status(vehicle.getStatus())
                .notes(vehicle.getNotes())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }

    /**
     * Gửi email thông báo cho Admin có đơn đăng ký mới
     */
//    private void sendNewRegistrationNotificationToAdmin(User user) {
//        String subject = "[EVBSS] Đơn đăng ký mới - " + user.getRole();
//        String body = String.format("""
//            <h2>Thông báo đơn đăng ký mới</h2>
//            <p>Có một đơn đăng ký mới cần phê duyệt:</p>
//            <ul>
//                <li><strong>Họ tên:</strong> %s</li>
//                <li><strong>Email:</strong> %s</li>
//                <li><strong>Số điện thoại:</strong> %s</li>
//                <li><strong>Vai trò:</strong> %s</li>
//                <li><strong>CMND/CCCD:</strong> %s</li>
//                <li><strong>Địa chỉ:</strong> %s</li>
//            </ul>
//            <p>Vui lòng đăng nhập vào hệ thống quản trị để xem chi tiết và phê duyệt.</p>
//            """, user.getFullName(), user.getEmail(), user.getPhone(), user.getRole(), user.getIdentityCard(), user.getAddress());
//
//        String adminEmail = "admin@evbss.com";
//
//        EmailEvent emailEvent = EmailEvent.builder()
//                .to(adminEmail)
//                .subject(subject)
//                .body(body)
//                .build();
//        kafkaProducerService.sendEmailEvent(emailEvent);
//    }

    /**
     * Gửi email thông báo đơn đăng ký được chấp nhận kèm link xác nhận
     */
    private void sendApprovalEmailWithVerificationLink(User user, String token) {
        String verificationUrl = frontendUrl + "/verify-registration?token=" + token;

        String roleDisplay = user.getRole() == Role.DRIVER ? "Tài xế" :
                            user.getRole() == Role.STAFF ? "Nhân viên trạm" : "Người dùng";

        String subject = "Chúc mừng! Đơn đăng ký của bạn đã được phê duyệt";
        String body = String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Chúc mừng %s!</h2>
                <p>Đơn đăng ký tài khoản <strong>%s</strong> của bạn đã được Admin phê duyệt.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 15px 0;">Để hoàn tất quá trình đăng ký và kích hoạt tài khoản, vui lòng nhấn vào nút bên dưới:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="%s" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                            Xác nhận đăng ký
                        </a>
                    </div>
                    <p style="font-size: 12px; color: #6b7280; margin: 15px 0 0 0;">
                        Hoặc sao chép và dán đường link sau vào trình duyệt:<br/>
                        <a href="%s" style="color: #2563eb; word-break: break-all;">%s</a>
                    </p>
                </div>
                
                <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                    <p style="margin: 0; color: #92400e;">
                        <strong>Lưu ý quan trọng:</strong> Link xác nhận này có hiệu lực trong vòng <strong>48 giờ (2 ngày)</strong> kể từ bây giờ. 
                        Sau thời gian này, bạn sẽ cần liên hệ với admin để được hỗ trợ.
                    </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">
                    Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                
                <p style="color: #6b7280; font-size: 14px;">
                    Trân trọng,<br/>
                    <strong>EV Battery Swap Station Team</strong>
                </p>
            </div>
            """, user.getFullName(), roleDisplay, verificationUrl, verificationUrl, verificationUrl);

        EmailEvent emailEvent = EmailEvent.builder()
                .to(user.getEmail())
                .subject(subject)
                .body(body)
                .build();
        kafkaProducerService.sendEmailEvent(emailEvent);

        log.info("Đã gửi email xác nhận đăng ký đến: {}", user.getEmail());
    }

    /**
     * Gửi email thông báo đơn đăng ký bị từ chối
     */
    private void sendRejectionEmailToUser(User user) {
        String subject = "Thông báo về đơn đăng ký của bạn";
        String body = String.format("""
            <h2>Xin chào %s,</h2>
            <p>Rất tiếc, đơn đăng ký tài khoản <strong>%s</strong> của bạn đã bị từ chối.</p>
            <p><strong>Lý do:</strong> %s</p>
            <p>Nếu bạn có thắc mắc hoặc muốn đăng ký lại với thông tin đầy đủ hơn, vui lòng liên hệ với chúng tôi.</p>
            <p>Trân trọng,<br/>EV Battery Swap Station Team</p>
            """, user.getFullName(), user.getRole(), user.getRejectionReason());

        EmailEvent emailEvent = EmailEvent.builder()
                .to(user.getEmail())
                .subject(subject)
                .body(body)
                .build();
        kafkaProducerService.sendEmailEvent(emailEvent);
    }
}
