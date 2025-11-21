package com.boilerplate.billing.model.event.consumer.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "stations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String stationCode;

    @Column(nullable = false)
    private String stationName;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String phoneNumber;

}
