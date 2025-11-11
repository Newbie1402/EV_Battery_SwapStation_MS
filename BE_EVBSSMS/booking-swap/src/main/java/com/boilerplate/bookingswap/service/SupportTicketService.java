package com.boilerplate.bookingswap.service;

import com.boilerplate.bookingswap.enums.TicketStatus;
import com.boilerplate.bookingswap.exception.NotFoundException;
import com.boilerplate.bookingswap.model.entity.SupportTicket;
import com.boilerplate.bookingswap.model.dto.request.SupportTicketRequest;
import com.boilerplate.bookingswap.model.dto.request.SupportTicketUpdateRequest;
import com.boilerplate.bookingswap.model.dto.respone.SupportTicketResponse;
import com.boilerplate.bookingswap.repository.SupportTicketRepository;
import com.boilerplate.bookingswap.service.mapper.SupportTicketMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý business logic cho SupportTicket
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final SupportTicketMapper ticketMapper;

    /**
     * Tạo ticket hỗ trợ mới
     */
    @Transactional
    public SupportTicketResponse createTicket(SupportTicketRequest requestDTO) {
        log.info("Tạo ticket hỗ trợ mới cho tài xế: {}", requestDTO.getDriverId());

        SupportTicket ticket = ticketMapper.toEntity(requestDTO);
        SupportTicket savedTicket = ticketRepository.save(ticket);

        log.info("Đã tạo ticket ID: {} cho tài xế: {}", savedTicket.getId(), savedTicket.getDriverId());

        return ticketMapper.toResponseDTO(savedTicket);
    }

    /**
     * Lấy thông tin ticket theo ID
     */
    public SupportTicketResponse getTicketById(Long id) {
        log.debug("Lấy thông tin ticket ID: {}", id);

        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ticket với ID: " + id));

        return ticketMapper.toResponseDTO(ticket);
    }

    /**
     * Lấy tất cả ticket của tài xế
     */
    public Page<SupportTicketResponse> getDriverTickets(String driverId, int page, int size) {
        log.debug("Lấy danh sách ticket của tài xế: {}", driverId);

        Pageable pageable = PageRequest.of(page, size);
        Page<SupportTicket> tickets = ticketRepository.findByDriverId(driverId, pageable);

        return tickets.map(ticketMapper::toResponseDTO);
    }

    /**
     * Lấy tất cả ticket theo trạng thái
     */
    public Page<SupportTicketResponse> getTicketsByStatus(TicketStatus status, int page, int size) {
        log.debug("Lấy danh sách ticket theo trạng thái: {}", status);

        Pageable pageable = PageRequest.of(page, size);
        Page<SupportTicket> tickets = ticketRepository.findByTicketStatus(status, pageable);

        return tickets.map(ticketMapper::toResponseDTO);
    }

    /**
     * Lấy tất cả ticket đang mở
     */
    public Page<SupportTicketResponse> getOpenTickets(int page, int size) {
        log.debug("Lấy danh sách ticket đang mở");

        Pageable pageable = PageRequest.of(page, size);
        Page<SupportTicket> tickets = ticketRepository.findOpenTickets(pageable);

        return tickets.map(ticketMapper::toResponseDTO);
    }

    /**
     * Lấy ticket chưa có phản hồi
     */
    public List<SupportTicketResponse> getTicketsWithoutResponse() {
        log.debug("Lấy danh sách ticket chưa có phản hồi");

        List<SupportTicket> tickets = ticketRepository.findTicketsWithoutResponse();

        return tickets.stream()
                .map(ticketMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật ticket (Admin/Staff)
     */
    @Transactional
    public SupportTicketResponse updateTicket(Long id, SupportTicketUpdateRequest updateDTO) {
        log.info("Cập nhật ticket ID: {}", id);

        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ticket với ID: " + id));

        ticketMapper.updateEntityFromDTO(ticket, updateDTO);
        SupportTicket updatedTicket = ticketRepository.save(ticket);

        log.info("Đã cập nhật ticket ID: {}", id);

        return ticketMapper.toResponseDTO(updatedTicket);
    }

    /**
     * Đóng ticket
     */
    @Transactional
    public SupportTicketResponse closeTicket(Long id, String finalResponse) {
        log.info("Đóng ticket ID: {}", id);

        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ticket với ID: " + id));

        ticket.setTicketStatus(TicketStatus.CLOSED);
        if (finalResponse != null) {
            ticket.setResponse(finalResponse);
        }

        SupportTicket closedTicket = ticketRepository.save(ticket);

        log.info("Đã đóng ticket ID: {}", id);

        return ticketMapper.toResponseDTO(closedTicket);
    }

    /**
     * Xóa ticket
     */
    @Transactional
    public void deleteTicket(Long id) {
        log.info("Xóa ticket ID: {}", id);

        if (!ticketRepository.existsById(id)) {
            throw new NotFoundException("Không tìm thấy ticket với ID: " + id);
        }

        ticketRepository.deleteById(id);

        log.info("Đã xóa ticket ID: {}", id);
    }
}


