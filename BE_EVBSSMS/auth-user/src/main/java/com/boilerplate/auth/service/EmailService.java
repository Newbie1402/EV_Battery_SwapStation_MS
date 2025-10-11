package com.boilerplate.auth.service;

import com.boilerplate.auth.enums.OtpType;
import com.boilerplate.auth.model.event.EmailEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.kafka.annotation.KafkaListener;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Service xử lý gửi email
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    /**
     * Lắng nghe message từ Kafka và gửi email
     */
    @KafkaListener(topics = "email-topic", groupId = "auth-user-service")
    public void consumeEmailEvent(EmailEvent emailEvent) {
        try {
            sendEmail(emailEvent.getTo(), emailEvent.getSubject(), emailEvent.getBody());
            log.info("Đã gửi email thành công đến: {}", emailEvent.getTo());
        } catch (Exception e) {
            log.error("Lỗi khi gửi email đến: {}", emailEvent.getTo(), e);
        }
    }

    /**
     * Gửi email
     */
    private void sendEmail(String to, String subject, String body) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, true);

        mailSender.send(message);
    }

    /**
     * Tạo nội dung email OTP
     */
    public String buildOtpEmailBody(String fullName, String otp, OtpType otpType) {
        String purpose = otpType == OtpType.REGISTRATION ? "xác thực tài khoản" : "đặt lại mật khẩu";

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; 
                               padding: 20px; background-color: white; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>EV Battery Swap Station</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Bạn đã yêu cầu %s. Vui lòng sử dụng mã OTP dưới đây:</p>
                        <div class="otp-code">%s</div>
                        <p>Mã OTP này có hiệu lực trong vòng <strong>5 phút</strong>.</p>
                        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 EV Battery Swap Station Management System</p>
                        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(fullName, purpose, otp);
    }

    /**
     * Tạo nội dung email chào mừng
     */
    public String buildWelcomeEmailBody(String fullName, String role) {
        String roleText = getRoleText(role);

        StringBuilder body = new StringBuilder();
        body.append("<!DOCTYPE html>");
        body.append("<html><head><style>");
        body.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        body.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        body.append(".header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }");
        body.append(".content { padding: 20px; background-color: #f9f9f9; }");
        body.append(".features { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }");
        body.append(".features ul { margin: 10px 0; padding-left: 20px; }");
        body.append(".features li { margin: 8px 0; }");
        body.append(".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }");
        body.append("</style></head><body>");
        body.append("<div class='container'>");
        body.append("<div class='header'><h1>Chào mừng đến với EV Battery Swap Station!</h1></div>");
        body.append("<div class='content'>");
        body.append("<p>Xin chào <strong>").append(fullName).append("</strong>,</p>");
        body.append("<p>Tài khoản của bạn với vai trò <strong>").append(roleText).append("</strong> đã được kích hoạt thành công!</p>");

        if ("DRIVER".equals(role)) {
            body.append("<div class='features'>");
            body.append("<p><strong>Bạn có thể bắt đầu sử dụng các tính năng sau:</strong></p>");
            body.append("<ul>");
            body.append("<li>🔍 Tìm kiếm trạm đổi pin gần nhất</li>");
            body.append("<li>📅 Đặt lịch đổi pin trước</li>");
            body.append("<li>🚗 Quản lý phương tiện của bạn</li>");
            body.append("<li>📊 Xem lịch sử giao dịch</li>");
            body.append("<li>💳 Quản lý gói thuê pin</li>");
            body.append("</ul>");
            body.append("</div>");
        } else if ("STAFF".equals(role)) {
            body.append("<div class='features'>");
            body.append("<p><strong>Bạn có thể bắt đầu làm việc với các chức năng:</strong></p>");
            body.append("<ul>");
            body.append("<li>📦 Quản lý tồn kho pin tại trạm</li>");
            body.append("<li>🔄 Xử lý giao dịch đổi pin</li>");
            body.append("<li>🔋 Ghi nhận trạng thái pin</li>");
            body.append("<li>👥 Hỗ trợ khách hàng</li>");
            body.append("</ul>");
            body.append("</div>");
        } else if ("ADMIN".equals(role)) {
            body.append("<div class='features'>");
            body.append("<p><strong>Bạn có quyền quản lý toàn bộ hệ thống:</strong></p>");
            body.append("<ul>");
            body.append("<li>🏢 Quản lý trạm và nhân viên</li>");
            body.append("<li>📈 Xem báo cáo và thống kê</li>");
            body.append("<li>⚙️ Cấu hình hệ thống</li>");
            body.append("<li>👤 Quản lý người dùng</li>");
            body.append("</ul>");
            body.append("</div>");
        }

        body.append("<p>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi!</p>");
        body.append("<p>Trân trọng,<br/><strong>EV Battery Swap Station Team</strong></p>");
        body.append("</div>");
        body.append("<div class='footer'>");
        body.append("<p>© 2025 EV Battery Swap Station Management System</p>");
        body.append("<p>Nếu bạn cần hỗ trợ, vui lòng liên hệ support@evbss.com</p>");
        body.append("</div>");
        body.append("</div></body></html>");

        return body.toString();
    }

    /**
     * Tạo nội dung email thông báo đơn đăng ký đang chờ duyệt
     */
    public String buildRegistrationPendingEmailBody(String fullName, String role) {
        String roleText = getRoleText(role);

        StringBuilder body = new StringBuilder();
        body.append("<!DOCTYPE html>");
        body.append("<html><head><style>");
        body.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        body.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        body.append(".header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }");
        body.append(".content { padding: 20px; background-color: #f9f9f9; }");
        body.append(".info-box { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #FF9800; }");
        body.append(".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }");
        body.append("</style></head><body>");
        body.append("<div class='container'>");
        body.append("<div class='header'><h1>Đơn đăng ký đang được xử lý</h1></div>");
        body.append("<div class='content'>");
        body.append("<p>Xin chào <strong>").append(fullName).append("</strong>,</p>");
        body.append("<p>Cảm ơn bạn đã đăng ký tài khoản với vai trò <strong>").append(roleText).append("</strong> tại hệ thống EV Battery Swap Station.</p>");
        body.append("<div class='info-box'>");
        body.append("<p><strong>📋 Trạng thái đơn đăng ký:</strong> Đang chờ Admin phê duyệt</p>");
        body.append("<p>Đơn đăng ký của bạn đang được xem xét bởi đội ngũ quản trị. Quá trình này thường mất từ 1-2 ngày làm việc.</p>");
        body.append("</div>");
        body.append("<p><strong>Các bước tiếp theo:</strong></p>");
        body.append("<ol>");
        body.append("<li>Admin sẽ xem xét và phê duyệt đơn đăng ký của bạn</li>");
        body.append("<li>Bạn sẽ nhận được email thông báo kết quả</li>");
        body.append("<li>Nếu được chấp nhận, bạn sẽ nhận được mã OTP để xác thực tài khoản</li>");
        body.append("<li>Sau khi xác thực OTP, bạn có thể đăng nhập và sử dụng hệ thống</li>");
        body.append("</ol>");
        body.append("<p>Vui lòng kiên nhẫn chờ đợi. Chúng tôi sẽ liên hệ với bạn qua email này ngay khi có kết quả.</p>");
        body.append("<p>Trân trọng,<br/><strong>EV Battery Swap Station Team</strong></p>");
        body.append("</div>");
        body.append("<div class='footer'>");
        body.append("<p>© 2025 EV Battery Swap Station Management System</p>");
        body.append("<p>Nếu bạn có thắc mắc, vui lòng liên hệ support@evbss.com</p>");
        body.append("</div>");
        body.append("</div></body></html>");

        return body.toString();
    }

    /**
     * Chuyển đổi role code sang text tiếng Việt
     */
    private String getRoleText(String role) {
        return switch (role.toUpperCase()) {
            case "DRIVER" -> "Tài xế";
            case "STAFF" -> "Nhân viên trạm";
            case "ADMIN" -> "Quản trị viên";
            default -> role;
        };
    }
}
