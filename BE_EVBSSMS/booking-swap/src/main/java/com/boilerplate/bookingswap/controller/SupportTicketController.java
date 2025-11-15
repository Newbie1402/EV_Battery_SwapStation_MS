package com.boilerplate.bookingswap.controller;

import com.boilerplate.bookingswap.enums.TicketStatus;
import com.boilerplate.bookingswap.model.dto.request.SupportTicketRequest;
import com.boilerplate.bookingswap.model.dto.request.SupportTicketUpdateRequest;
import com.boilerplate.bookingswap.model.response.ResponseData;
import com.boilerplate.bookingswap.model.dto.respone.SupportTicketResponse;
import com.boilerplate.bookingswap.service.SupportTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các API liên quan đến SupportTicket
 */
@RestController
@RequestMapping("/api/support-tickets")
@RequiredArgsConstructor
@Slf4j
public class SupportTicketController {

    private final SupportTicketService ticketService;

    /**
     * Tạo ticket hỗ trợ mới
     */
    @PostMapping
    public ResponseEntity<ResponseData<SupportTicketResponse>> createTicket(
            @Valid @RequestBody SupportTicketRequest requestDTO) {
        log.info("REST request to create support ticket for driver: {}", requestDTO.getDriverId());

        SupportTicketResponse response = ticketService.createTicket(requestDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ResponseData.<SupportTicketResponse>builder()
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Tạo ticket hỗ trợ thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy thông tin ticket theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResponseData<SupportTicketResponse>> getTicketById(@PathVariable Long id) {
        log.info("REST request to get support ticket: {}", id);

        SupportTicketResponse response = ticketService.getTicketById(id);

        return ResponseEntity.ok(
                ResponseData.<SupportTicketResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy thông tin ticket thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy danh sách ticket của tài xế
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<ResponseData<Page<SupportTicketResponse>>> getDriverTickets(
            @PathVariable String driverId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get tickets for driver: {}", driverId);

        Page<SupportTicketResponse> response = ticketService.getDriverTickets(driverId, page, size);

        return ResponseEntity.ok(
                ResponseData.<Page<SupportTicketResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách ticket thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy danh sách ticket theo trạng thái
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ResponseData<Page<SupportTicketResponse>>> getTicketsByStatus(
            @PathVariable TicketStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get tickets by status: {}", status);

        Page<SupportTicketResponse> response = ticketService.getTicketsByStatus(status, page, size);

        return ResponseEntity.ok(
                ResponseData.<Page<SupportTicketResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách ticket thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy danh sách ticket đang mở
     */
    @GetMapping("/open")
    public ResponseEntity<ResponseData<Page<SupportTicketResponse>>> getOpenTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get open tickets");

        Page<SupportTicketResponse> response = ticketService.getOpenTickets(page, size);

        return ResponseEntity.ok(
                ResponseData.<Page<SupportTicketResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách ticket đang mở thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy danh sách ticket chưa có phản hồi
     */
    @GetMapping("/without-response")
    public ResponseEntity<ResponseData<List<SupportTicketResponse>>> getTicketsWithoutResponse() {
        log.info("REST request to get tickets without response");

        List<SupportTicketResponse> response = ticketService.getTicketsWithoutResponse();

        return ResponseEntity.ok(
                ResponseData.<List<SupportTicketResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách ticket chưa phản hồi thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Cập nhật ticket (Admin/Staff)
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ResponseData<SupportTicketResponse>> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody SupportTicketUpdateRequest updateDTO) {
        log.info("REST request to update support ticket: {}", id);

        SupportTicketResponse response = ticketService.updateTicket(id, updateDTO);

        return ResponseEntity.ok(
                ResponseData.<SupportTicketResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Cập nhật ticket thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Đóng ticket
     */
    @PostMapping("/{id}/close")
    public ResponseEntity<ResponseData<SupportTicketResponse>> closeTicket(
            @PathVariable Long id,
            @RequestParam(required = false) String finalResponse) {
        log.info("REST request to close support ticket: {}", id);

        SupportTicketResponse response = ticketService.closeTicket(id, finalResponse);

        return ResponseEntity.ok(
                ResponseData.<SupportTicketResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Đóng ticket thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Xóa ticket
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseData<String>> deleteTicket(@PathVariable Long id) {
        log.info("REST request to delete support ticket: {}", id);

        ticketService.deleteTicket(id);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Xóa ticket thành công")
                        .data("Đã xóa ticket ID: " + id)
                        .build()
        );
    }
}


