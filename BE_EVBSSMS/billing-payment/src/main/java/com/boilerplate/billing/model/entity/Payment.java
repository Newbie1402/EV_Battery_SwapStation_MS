package com.boilerplate.billing.model.entity;

import com.boilerplate.billing.enums.PaymentMethod;
import com.boilerplate.billing.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // ID tham chiếu tới Booking Service hoặc Billing logic khác
    private Long bookingId;
    // ID của khách hàng (hoặc userId từ User Service)
    private Long customerId;
    // Tổng tiền cuối cùng sau khi tính giảm giá + thuế
    private Double totalAmount;
    // Giá gốc trước giảm giá và thuế
    private Double baseAmount;
    // Giảm giá (nếu có, % hoặc tiền)
    private Double discountAmount;
    // Thuế VAT hoặc thuế dịch vụ (tùy cấu hình)
    private Double taxAmount;
    // "PACKAGE" hoặc "SINGLE_SWAP"
    private String paymentType;
    @Enumerated(EnumType.STRING)
    private PaymentMethod method; // VNPAY, CASH, MOMO, CREDIT_CARD...
    @Enumerated(EnumType.STRING)
    private PaymentStatus status; // PENDING, SUCCESS, FAILED, REFUNDED
    // Mã giao dịch do cổng thanh toán trả về
    private String transactionId;
    private String description;
    // Thời điểm thanh toán
    private LocalDateTime paymentTime;
    // Thời điểm tạo bản ghi (có thể khác với paymentTime nếu xử lý async)
    private LocalDateTime createdAt = LocalDateTime.now();
}
