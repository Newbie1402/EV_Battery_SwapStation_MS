package com.boilerplate.auth.service;

import com.boilerplate.auth.entity.SupportTicket;
import com.boilerplate.auth.entity.User;
import com.boilerplate.auth.entity.Vehicle;
import com.boilerplate.auth.enums.TicketPriority;
import com.boilerplate.auth.enums.TicketStatus;
import com.boilerplate.auth.exception.ResourceNotFoundException;
import com.boilerplate.auth.model.dto.request.CreateSupportTicketRequest;
import com.boilerplate.auth.model.dto.request.UpdateTicketStatusRequest;
import com.boilerplate.auth.model.dto.response.SupportTicketDetailResponse;
import com.boilerplate.auth.model.event.SupportTicketEvent;
import com.boilerplate.auth.repository.SupportTicketRepository;
import com.boilerplate.auth.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service xử lý Support Ticket: lưu DB và gửi event qua Kafka
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SupportTicketService {

    private final SupportTicketEventPublisher eventPublisher;
    private final VehicleRepository vehicleRepository;
    private final SupportTicketRepository supportTicketRepository;

    @Value("${spring.application.name:auth-service}")
    private String serviceName;

    /**
     * Tạo support ticket: lưu vào DB và gửi event qua Kafka
     */
    @Transactional
    public String createSupportTicket(User user, CreateSupportTicketRequest request) {

        log.info("Creating support ticket: employeeId={}, type={}",
            user.getEmployeeId(), request.getTicketType());

        // Load vehicle nếu có
        Vehicle vehicle = null;
        if (request.getVehicleId() != null && !request.getVehicleId().isBlank()) {
            vehicle = vehicleRepository.findByVehicleId(request.getVehicleId()).orElse(null);
            if (vehicle == null) {
                log.warn("Vehicle not found: vehicleId={}", request.getVehicleId());
            }
        }

        // Generate ticket ID
        String ticketId = generateTicketId();

        // Tạo entity và lưu vào DB
        SupportTicket ticket = SupportTicket.builder()
            .ticketId(ticketId)
            .user(user)
            .vehicle(vehicle)
            .location(request.getLocation())
            .ticketType(request.getTicketType())
            .priority(request.getPriority() != null ? request.getPriority() : TicketPriority.MEDIUM)
            .status(TicketStatus.OPEN)
            .title(request.getTitle())
            .description(request.getDescription())
            .attachments(request.getAttachments())
            .incidentTime(request.getIncidentTime() != null ? request.getIncidentTime() : Instant.now())
            .build();

        supportTicketRepository.save(ticket);
        log.info("Support ticket saved to DB: ticketId={}", ticketId);

        // Build và publish event qua Kafka
        SupportTicketEvent event = buildEvent(ticketId, user, vehicle, request);

        publishEvent(event, ticketId);

        return ticketId;
    }

    /**
     * Build SupportTicketEvent
     */
    private SupportTicketEvent buildEvent(
            String ticketId,
            User user,
            Vehicle vehicle,
            CreateSupportTicketRequest request
    ) {
        Instant now = Instant.now();

        // Build event data
        SupportTicketEvent.SupportTicketData data = SupportTicketEvent.SupportTicketData.builder()
            .ticketId(ticketId)
            .employeeId(user.getEmployeeId())
            .vehicleId(vehicle != null ? vehicle.getVehicleId() : null)
            .vin(vehicle != null ? vehicle.getVin() : null)
            .licensePlate(vehicle != null ? vehicle.getLicensePlate() : null)
            .model(vehicle != null ? vehicle.getModel() : null)
            .location(request.getLocation())
            .ticketType(request.getTicketType())
            .priority(request.getPriority() != null ? request.getPriority() : TicketPriority.MEDIUM)
            .title(request.getTitle())
            .description(request.getDescription())
            .attachments(request.getAttachments())
            .incidentTime(request.getIncidentTime() != null ? request.getIncidentTime() : now)
            .createdAt(now)
            .build();

        // Build metadata
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("service", serviceName);
        metadata.put("version", "1.0");

        // Build event
        return SupportTicketEvent.builder()
            .eventId(UUID.randomUUID().toString())
            .source(String.format("/%s/support-tickets", serviceName))
            .specVersion("1.0")
            .type("com.evbss.support.ticket.created")
            .eventTime(now)
            .correlationId(UUID.randomUUID().toString())
            .dataContentType("application/json")
            .data(data)
            .metadata(metadata)
            .build();
    }

    /**
     * Publish event qua Kafka
     */
    private void publishEvent(SupportTicketEvent event, String ticketId) {
        eventPublisher.publishSupportTicketCreated(event)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish support ticket event: ticketId={}", ticketId, ex);
                } else {
                    log.info("Support ticket event published: ticketId={}, offset={}",
                        ticketId, result.getRecordMetadata().offset());
                }
            });
    }

    /**
     * Generate unique ticket ID
     */
    private String generateTicketId() {
        return String.format("TKT-%d-%s",
            Instant.now().toEpochMilli(),
            UUID.randomUUID().toString().substring(0, 8));
    }

    /**
     * Lấy message dựa trên priority
     */
    public String getPriorityMessage(TicketPriority priority) {
        return switch (priority) {
            case CRITICAL -> "Ticket khẩn cấp! Station Service sẽ xử lý ngay.";
            case HIGH -> "Ticket ưu tiên cao đã gửi. Xử lý trong 2 giờ.";
            case MEDIUM -> "Support ticket đã gửi. Xử lý trong 24 giờ.";
            case LOW -> "Ticket đã gửi. Xử lý trong 3 ngày.";
        };
    }

    /**
     * Cập nhật trạng thái support ticket
     * resolvedBy tự động lấy từ employeeId của user gọi API
     */
    @Transactional
    public SupportTicket updateTicketStatus(String ticketId, UpdateTicketStatusRequest request, User resolvedByUser) {
        log.info("Updating ticket status: ticketId={}, newStatus={}, resolvedBy={}",
            ticketId, request.getStatus(), resolvedByUser.getEmployeeId());

        SupportTicket ticket = supportTicketRepository.findByTicketId(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy support ticket: " + ticketId));

        // Cập nhật trạng thái
        ticket.setStatus(request.getStatus());

        // Nếu trạng thái là RESOLVED hoặc CLOSED, lưu thông tin người giải quyết và thời gian
        if (request.getStatus() == TicketStatus.RESOLVED || request.getStatus() == TicketStatus.CLOSED) {
            if (ticket.getResolvedAt() == null) {
                ticket.setResolvedAt(Instant.now());
            }
            // Lưu employeeId của người giải quyết
            ticket.setResolvedBy(resolvedByUser.getEmployeeId());
        }

        // Cập nhật ghi chú giải quyết nếu có
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            String existingNotes = ticket.getResolutionNotes();
            String newNote = String.format("[%s - %s]: %s",
                Instant.now().toString(),
                resolvedByUser.getEmployeeId(),
                request.getNotes());

            if (existingNotes != null) {
                ticket.setResolutionNotes(existingNotes + "\n" + newNote);
            } else {
                ticket.setResolutionNotes(newNote);
            }
        }

        supportTicketRepository.save(ticket);
        log.info("Ticket status updated: ticketId={}, status={}, resolvedBy={}",
            ticketId, request.getStatus(), resolvedByUser.getEmployeeId());

        return ticket;
    }

    /**
     * Lấy ticket theo ticketId
     */
    public SupportTicket getTicketById(String ticketId) {
        return supportTicketRepository.findByTicketId(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy support ticket: " + ticketId));
    }

    /**
     * Lấy ticket theo ticketId và convert sang DTO
     */
    public SupportTicketDetailResponse getTicketDetailById(String ticketId) {
        SupportTicket ticket = supportTicketRepository.findByTicketId(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy support ticket: " + ticketId));

        return convertToDetailResponse(ticket);
    }

    /**
     * Convert SupportTicket entity sang SupportTicketDetailResponse DTO
     */
    private SupportTicketDetailResponse convertToDetailResponse(SupportTicket ticket) {
        // Build user info
        SupportTicketDetailResponse.UserInfo userInfo = SupportTicketDetailResponse.UserInfo.builder()
            .id(ticket.getUser().getId())
            .email(ticket.getUser().getEmail())
            .fullName(ticket.getUser().getFullName())
            .employeeId(ticket.getUser().getEmployeeId())
            .phone(ticket.getUser().getPhone())
            .build();

        // Build vehicle info (nếu có)
        SupportTicketDetailResponse.VehicleInfo vehicleInfo = null;
        if (ticket.getVehicle() != null) {
            vehicleInfo = SupportTicketDetailResponse.VehicleInfo.builder()
                .id(ticket.getVehicle().getId())
                .vehicleId(ticket.getVehicle().getVehicleId())
                .vin(ticket.getVehicle().getVin())
                .licensePlate(ticket.getVehicle().getLicensePlate())
                .model(ticket.getVehicle().getModel())
                .build();
        }

        // Build response
        return SupportTicketDetailResponse.builder()
            .id(ticket.getId())
            .ticketId(ticket.getTicketId())
            .user(userInfo)
            .vehicle(vehicleInfo)
            .location(ticket.getLocation())
            .ticketType(ticket.getTicketType())
            .priority(ticket.getPriority())
            .status(ticket.getStatus())
            .title(ticket.getTitle())
            .description(ticket.getDescription())
            .attachments(ticket.getAttachments())
            .incidentTime(ticket.getIncidentTime())
            .resolvedAt(ticket.getResolvedAt())
            .resolvedBy(ticket.getResolvedBy())
            .resolutionNotes(ticket.getResolutionNotes())
            .createdAt(ticket.getCreatedAt())
            .updatedAt(ticket.getUpdatedAt())
            .build();
    }


    private SupportTicketDetailResponse.VehicleInfo mapVehicle(Vehicle vehicle) {
        if (vehicle == null) return null;
        return SupportTicketDetailResponse.VehicleInfo.builder()
                .id(vehicle.getId())
                .vehicleId(vehicle.getVehicleId())
                .vin(vehicle.getVin())
                .licensePlate(vehicle.getLicensePlate())
                .model(vehicle.getModel())
                .build();
    }

    private SupportTicketDetailResponse.UserInfo mapUser(User user) {
        if (user == null) return null;
        return SupportTicketDetailResponse.UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .employeeId(user.getEmployeeId())
                .phone(user.getPhone())
                .build();
    }

    public List<SupportTicketDetailResponse> getAllTickets() {
        return supportTicketRepository.findAll()
                .stream()
                .map(ticket -> SupportTicketDetailResponse.builder()
                        .id(ticket.getId())
                        .ticketId(ticket.getTicketId())
                        .user(mapUser(ticket.getUser()))
                        .vehicle(mapVehicle(ticket.getVehicle()))
                        .location(ticket.getLocation())
                        .ticketType(ticket.getTicketType())
                        .priority(ticket.getPriority())
                        .status(ticket.getStatus())
                        .title(ticket.getTitle())
                        .description(ticket.getDescription())
                        .attachments(ticket.getAttachments())
                        .incidentTime(ticket.getIncidentTime())
                        .resolvedAt(ticket.getResolvedAt())
                        .resolvedBy(ticket.getResolvedBy())
                        .resolutionNotes(ticket.getResolutionNotes())
                        .createdAt(ticket.getCreatedAt())
                        .updatedAt(ticket.getUpdatedAt())
                        .build())
                .toList();
    }

    public List<SupportTicketDetailResponse> getTicketsByEmployeeId(String employeeId) {
        if (employeeId == null || employeeId.isBlank()) {
            log.warn("employeeId rỗng - trả về danh sách trống");
            return List.of();
        }
        List<SupportTicket> tickets = supportTicketRepository.findByEmployeeId(employeeId);
        log.info("Tìm thấy {} tickets cho employeeId={}", tickets.size(), employeeId);
        return tickets.stream()
                .map(this::convertToDetailResponse)
                .collect(Collectors.toList());
    }
}
