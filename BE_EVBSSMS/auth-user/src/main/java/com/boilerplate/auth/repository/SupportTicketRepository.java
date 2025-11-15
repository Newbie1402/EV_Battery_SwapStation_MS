package com.boilerplate.auth.repository;

import com.boilerplate.auth.entity.SupportTicket;
import com.boilerplate.auth.entity.User;
import com.boilerplate.auth.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository quản lý Support Ticket
 */
@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    /**
     * Tìm ticket theo ticket ID
     */
    Optional<SupportTicket> findByTicketId(String ticketId);

    /**
     * Tìm tất cả tickets của một user
     */
    List<SupportTicket> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Tìm tickets theo user và status
     */
    List<SupportTicket> findByUserAndStatusOrderByCreatedAtDesc(User user, TicketStatus status);

    /**
     * Tìm tickets theo status
     */
    Page<SupportTicket> findByStatus(TicketStatus status, Pageable pageable);

    /**
     * Đếm số ticket theo status của một user
     */
    long countByUserAndStatus(User user, TicketStatus status);

    /**
     * Kiểm tra ticket ID đã tồn tại chưa
     */
    boolean existsByTicketId(String ticketId);
}

