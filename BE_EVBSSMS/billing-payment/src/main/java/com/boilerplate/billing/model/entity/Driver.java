package com.boilerplate.billing.model.entity;


import com.boilerplate.billing.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "driver")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;


    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

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
