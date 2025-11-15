package com.boilerplate.auth.service;

import com.boilerplate.auth.constant.KafkaConstants;
import com.boilerplate.auth.model.event.SupportTicketEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.internals.RecordHeader;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Service chịu trách nhiệm publish Support Ticket events lên Kafka
 *
 * Production features:
 * - Async publishing với CompletableFuture
 * - Custom headers (tracing, metadata)
 * - Error handling và logging
 * - Metrics ready
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SupportTicketEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Publish event Support Ticket Created
     *
     * @param event SupportTicketEvent
     * @return CompletableFuture<SendResult> để handle async
     */
    public CompletableFuture<SendResult<String, Object>> publishSupportTicketCreated(SupportTicketEvent event) {

        validateEvent(event);

        String topic = KafkaConstants.TOPIC_SUPPORT_TICKET_CREATED;
        String key = event.getData().getTicketId(); // Partition by ticketId

        // Tạo ProducerRecord với custom headers
        ProducerRecord<String, Object> producerRecord = new ProducerRecord<>(
            topic,
            null, // Partition sẽ được xác định bởi key
            key,
            event,
            createHeaders(event)
        );

        // Log trước khi gửi
        log.info("Publishing Support Ticket Created Event: ticketId={}, employeeId={}, type={}, priority={}",
            event.getData().getTicketId(),
            event.getData().getEmployeeId(),
            event.getData().getTicketType(),
            event.getData().getPriority());

        // Send async và handle callback
        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(producerRecord);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                handleSuccess(result, event);
            } else {
                handleFailure(ex, event);
            }
        });

        return future;
    }

    /**
     * Publish event Support Ticket Updated (cho tương lai)
     */
    public CompletableFuture<SendResult<String, Object>> publishSupportTicketUpdated(SupportTicketEvent event) {

        validateEvent(event);

        String topic = KafkaConstants.TOPIC_SUPPORT_TICKET_UPDATED;
        String key = event.getData().getTicketId();

        ProducerRecord<String, Object> producerRecord = new ProducerRecord<>(
            topic,
            null,
            key,
            event,
            createHeaders(event)
        );

        log.info("Publishing Support Ticket Updated Event: ticketId={}",
            event.getData().getTicketId());

        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(producerRecord);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                handleSuccess(result, event);
            } else {
                handleFailure(ex, event);
            }
        });

        return future;
    }

    /**
     * Tạo custom headers cho message
     */
    private List<Header> createHeaders(SupportTicketEvent event) {
        List<Header> headers = new ArrayList<>();

        // Event metadata
        headers.add(new RecordHeader(
            KafkaConstants.HEADER_EVENT_ID,
            event.getEventId().getBytes(StandardCharsets.UTF_8)
        ));

        headers.add(new RecordHeader(
            KafkaConstants.HEADER_EVENT_TYPE,
            event.getType().getBytes(StandardCharsets.UTF_8)
        ));

        headers.add(new RecordHeader(
            KafkaConstants.HEADER_EVENT_TIMESTAMP,
            event.getEventTime().toString().getBytes(StandardCharsets.UTF_8)
        ));

        headers.add(new RecordHeader(
            KafkaConstants.HEADER_EVENT_SOURCE,
            event.getSource().getBytes(StandardCharsets.UTF_8)
        ));

        // Correlation ID cho distributed tracing
        if (event.getCorrelationId() != null) {
            headers.add(new RecordHeader(
                KafkaConstants.HEADER_CORRELATION_ID,
                event.getCorrelationId().getBytes(StandardCharsets.UTF_8)
            ));
        }

        return headers;
    }

    /**
     * Validate event trước khi publish
     */
    private void validateEvent(SupportTicketEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("Event không được null");
        }
        if (event.getData() == null) {
            throw new IllegalArgumentException("Event data không được null");
        }
        if (event.getData().getTicketId() == null || event.getData().getTicketId().isBlank()) {
            throw new IllegalArgumentException("Ticket ID không được để trống");
        }
    }

    /**
     * Handle success callback
     */
    private void handleSuccess(SendResult<String, Object> result, SupportTicketEvent event) {
        var metadata = result.getRecordMetadata();

        log.info("✓ Support Ticket Event published successfully: " +
            "ticketId={}, topic={}, partition={}, offset={}, timestamp={}",
            event.getData().getTicketId(),
            metadata.topic(),
            metadata.partition(),
            metadata.offset(),
            Instant.ofEpochMilli(metadata.timestamp()));

        // TODO: Có thể thêm metrics ở đây (ví dụ: Micrometer counter)
        // meterRegistry.counter("kafka.publish.success", "topic", metadata.topic()).increment();
    }

    /**
     * Handle failure callback
     */
    private void handleFailure(Throwable ex, SupportTicketEvent event) {
        log.error("✗ Failed to publish Support Ticket Event: ticketId={}, error={}",
            event.getData().getTicketId(),
            ex.getMessage(),
            ex);

        // TODO: Có thể thêm:
        // 1. Dead Letter Queue (DLQ) để lưu failed events
        // 2. Alert/notification cho DevOps team
        // 3. Metrics cho failure rate
        // meterRegistry.counter("kafka.publish.failure", "error", ex.getClass().getSimpleName()).increment();
    }
}
