package com.boilerplate.bookingswap.model.entity;

import com.boilerplate.bookingswap.enums.BookingStatus;
import com.boilerplate.bookingswap.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String driverId;
    private String stationId;
    private String batteryModelId;

    private LocalDateTime bookingTime;
    private LocalDateTime scheduledTime;

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

    private boolean isPaid = false;

    private String notes;

    private Long paymentId;

    private String packageId; // liên kết gói thuê pin nếu có

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Enumerated(EnumType.STRING)
    private BookingStatus bookingStatus;
}