package com.boilerplate.auth.controller;

import com.boilerplate.auth.model.dto.request.CreateSupportTicketRequest;
import com.boilerplate.auth.model.dto.request.UpdateTicketStatusRequest;
import com.boilerplate.auth.model.dto.response.CreateSupportTicketResponse;
import com.boilerplate.auth.model.dto.response.SupportTicketDetailResponse;
import com.boilerplate.auth.model.dto.response.UpdateTicketStatusResponse;
import com.boilerplate.auth.model.response.ResponseData;
import com.boilerplate.auth.security.CustomUserDetails;
import com.boilerplate.auth.service.SupportTicketService;
import com.boilerplate.auth.service.S3Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/support-tickets")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Support Ticket", description = "Gửi support ticket event qua Kafka khi gặp sự cố")
@SecurityRequirement(name = "bearerAuth")
public class SupportTicketController {

    private final SupportTicketService supportTicketService;
    private final S3Service s3Service;

    /**
     * Tạo support ticket - Gửi event qua Kafka sang Station Service
     */
    @PostMapping
    @Operation(
        summary = "Tạo support ticket",
        description = "Gửi support ticket event qua Kafka sang Station Service để xử lý và lưu DB. Gửi dữ liệu qua form-data: các trường text và file đính kèm."
    )
    @PreAuthorize("hasAnyRole('DRIVER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ResponseData<CreateSupportTicketResponse>> createSupportTicket(
            @RequestParam(value = "vehicleId", required = false) String vehicleId,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "ticketType") String ticketType,
            @RequestParam(value = "priority", required = false, defaultValue = "MEDIUM") String priority,
            @RequestParam(value = "title") String title,
            @RequestParam(value = "description") String description,
            @RequestParam(value = "incidentTime", required = false) String incidentTime,
            @RequestPart(value = "attachments", required = false) MultipartFile[] files,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        // Validate title và description
        if (title == null || title.isBlank()) {
            CreateSupportTicketResponse errorResponse = CreateSupportTicketResponse.builder()
                .ticketId(null)
                .status("ERROR")
                .message("Tiêu đề không được trống")
                .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseData<>(400, "Tiêu đề không được trống", errorResponse));
        }

        if (description == null || description.isBlank()) {
            CreateSupportTicketResponse errorResponse = CreateSupportTicketResponse.builder()
                .ticketId(null)
                .status("ERROR")
                .message("Mô tả không được trống")
                .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseData<>(400, "Mô tả không được trống", errorResponse));
        }

        // Xử lý upload file lên S3 nếu có file đính kèm
        List<String> attachmentUrls = new ArrayList<>();
        if (files != null) {
            for (MultipartFile file : files) {
                try {
                    String url = s3Service.uploadFile(file);
                    attachmentUrls.add(url);
                    log.info("Upload file thành công: {}", url);
                } catch (IOException e) {
                    log.error("Lỗi upload file lên S3", e);
                    CreateSupportTicketResponse errorResponse = CreateSupportTicketResponse.builder()
                        .ticketId(null)
                        .status("ERROR")
                        .message("Lỗi upload file lên S3: " + e.getMessage())
                        .build();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ResponseData<>(500, "Lỗi upload file lên S3", errorResponse));
                }
            }
        }

        // Parse enum với error handling
        com.boilerplate.auth.enums.SupportTicketType ticketTypeEnum;
        com.boilerplate.auth.enums.TicketPriority priorityEnum;

        try {
            ticketTypeEnum = com.boilerplate.auth.enums.SupportTicketType.valueOf(ticketType);
        } catch (IllegalArgumentException e) {
            CreateSupportTicketResponse errorResponse = CreateSupportTicketResponse.builder()
                .ticketId(null)
                .status("ERROR")
                .message("Loại ticket không hợp lệ. Các giá trị hợp lệ: BATTERY_ISSUE, STATION_ISSUE, PAYMENT_ISSUE, OTHER")
                .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseData<>(400, "Loại ticket không hợp lệ", errorResponse));
        }

        try {
            priorityEnum = com.boilerplate.auth.enums.TicketPriority.valueOf(priority);
        } catch (IllegalArgumentException e) {
            priorityEnum = com.boilerplate.auth.enums.TicketPriority.MEDIUM;
        }

        // Parse incident time
        Instant incidentTimeInstant;
        if (incidentTime != null && !incidentTime.isBlank()) {
            try {
                incidentTimeInstant = Instant.parse(incidentTime);
            } catch (Exception e) {
                incidentTimeInstant = Instant.now();
            }
        } else {
            incidentTimeInstant = Instant.now();
        }

        // Build DTO từ các trường nhận được
        CreateSupportTicketRequest request = CreateSupportTicketRequest.builder()
            .vehicleId(vehicleId)
            .location(location)
            .ticketType(ticketTypeEnum)
            .priority(priorityEnum)
            .title(title)
            .description(description)
            .incidentTime(incidentTimeInstant)
            .attachments(attachmentUrls)
            .build();

        // Gọi service xử lý
        String ticketId = supportTicketService.createSupportTicket(userDetails.getUser(), request);

        // Build response
        CreateSupportTicketResponse response = CreateSupportTicketResponse.builder()
            .ticketId(ticketId)
            .status("SENT")
            .message(supportTicketService.getPriorityMessage(priorityEnum))
            .build();

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(new ResponseData<>(201, "Gửi support ticket event thành công", response));
    }

    /**
     * Cập nhật trạng thái support ticket
     * resolvedBy tự động lấy từ token của người gọi API
     */
    @PatchMapping("/{ticketId}/status")
    @Operation(
        summary = "Cập nhật trạng thái support ticket",
        description = "API cập nhật trạng thái ticket. Người xử lý (resolvedBy) tự động lấy từ token của người gọi API"
    )
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ResponseData<UpdateTicketStatusResponse>> updateTicketStatus(
            @PathVariable String ticketId,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.info("Request to update ticket status: ticketId={}, status={}, by={}",
            ticketId, request.getStatus(), userDetails.getUser().getEmployeeId());

        var ticket = supportTicketService.updateTicketStatus(ticketId, request, userDetails.getUser());

        UpdateTicketStatusResponse response = UpdateTicketStatusResponse.builder()
            .ticketId(ticket.getTicketId())
            .status(ticket.getStatus())
            .updatedAt(ticket.getUpdatedAt())
            .message("Cập nhật trạng thái thành công")
            .build();

        return ResponseEntity.ok(new ResponseData<>(200, "Cập nhật trạng thái thành công", response));
    }

    /**
     * Lấy thông tin chi tiết support ticket
     */
    @GetMapping("/{ticketId}")
    @Operation(
        summary = "Lấy thông tin chi tiết support ticket",
        description = "Lấy thông tin chi tiết ticket theo ticketId"
    )
    @PreAuthorize("hasAnyRole('DRIVER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ResponseData<SupportTicketDetailResponse>> getTicketById(
            @PathVariable String ticketId
    ) {
        var ticketDetail = supportTicketService.getTicketDetailById(ticketId);
        return ResponseEntity.ok(new ResponseData<>(200, "Lấy thông tin ticket thành công", ticketDetail));
    }
}
