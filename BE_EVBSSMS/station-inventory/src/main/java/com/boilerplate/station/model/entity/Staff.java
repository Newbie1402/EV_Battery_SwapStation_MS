package com.boilerplate.station.model.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "staffs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Staff {

    @Id
    private String id;

    @Column(nullable = false, length = 100)
    private String email;
    @Column(length = 20)
    private String phone;


    @Column(nullable = false, length = 100)
    private String fullName;

    @Column
    private LocalDate birthday;


    @Column(length = 255)
    private String address;


    @Column(name = "employee_id", unique = true, length = 20)
    private String employeeId;


    @Column(name = "identity_card", length = 20)
    private String identityCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id") // tên cột trong table
    private Station station;
}
