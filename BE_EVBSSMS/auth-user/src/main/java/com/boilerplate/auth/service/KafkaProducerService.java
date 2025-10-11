package com.boilerplate.auth.service;

import com.boilerplate.auth.model.event.EmailEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

/**
 * Service gửi message lên Kafka
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String EMAIL_TOPIC = "email-topic";

    /**
     * Gửi email event lên Kafka
     */
    public void sendEmailEvent(EmailEvent emailEvent) {
        try {
            kafkaTemplate.send(EMAIL_TOPIC, emailEvent);
            log.info("Đã gửi email event lên Kafka: {}", emailEvent.getTo());
        } catch (Exception e) {
            log.error("Lỗi khi gửi email event lên Kafka", e);
            throw new RuntimeException("Không thể gửi email event", e);
        }
    }
}
