package com.boilerplate.station.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

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
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


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


    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "identity_card", unique = true, length = 20)
    private String identityCard;

    @Column(name = "assigned_station_id")
    private Long assignedStationId;

    @Column(name = "employee_id", unique = true, length = 20)
    private String employeeId;

}
