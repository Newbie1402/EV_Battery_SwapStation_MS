package com.boilerplate.bookingswap.model.entity;

import com.boilerplate.bookingswap.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String driverId;
    private String bookingId;

    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private TicketStatus ticketStatus;

    private String response; // phản hồi từ nhân viên hoặc admin

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
