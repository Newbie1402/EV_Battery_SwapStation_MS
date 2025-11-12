package com.boilerplate.bookingswap.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ratings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String bookingId;
    private String driverId;
    private String stationId;

    private int score; // từ 1–5 sao
    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();
}
