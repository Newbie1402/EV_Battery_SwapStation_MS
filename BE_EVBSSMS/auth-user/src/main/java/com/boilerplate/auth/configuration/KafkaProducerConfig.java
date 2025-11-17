package com.boilerplate.auth.configuration;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka Producer Configuration cho Auth Service
 *
 * Production-ready với:
 * - Retry mechanism
 * - Idempotence
 * - Compression
 * - Monitoring metrics
 */
@Configuration
@Slf4j
public class KafkaProducerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.producer.acks:all}")
    private String acks;

    @Value("${spring.kafka.producer.retries:3}")
    private Integer retries;

    @Value("${spring.kafka.producer.compression-type:snappy}")
    private String compressionType;

    @Value("${spring.kafka.producer.max-in-flight-requests-per-connection:5}")
    private Integer maxInFlightRequests;

    @Value("${spring.kafka.producer.enable-idempotence:true}")
    private Boolean enableIdempotence;

    @Value("${spring.kafka.producer.request-timeout-ms:30000}")
    private Integer requestTimeoutMs;

    @Value("${spring.kafka.producer.delivery-timeout-ms:120000}")
    private Integer deliveryTimeoutMs;

    /**
     * Cấu hình Producer Factory với các settings production-ready
     */
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();

        // Bootstrap servers
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);

        // Serializers
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        // Reliability settings
        configProps.put(ProducerConfig.ACKS_CONFIG, acks);
        configProps.put(ProducerConfig.RETRIES_CONFIG, retries);
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, enableIdempotence);

        // Performance & Compression
        configProps.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, compressionType);
        configProps.put(ProducerConfig.LINGER_MS_CONFIG, 10); // Batch messages trong 10ms
        configProps.put(ProducerConfig.BATCH_SIZE_CONFIG, 32768); // 32KB batch size

        // Timeout settings
        configProps.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, maxInFlightRequests);
        configProps.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, requestTimeoutMs);
        configProps.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, deliveryTimeoutMs);

        // Metadata
        configProps.put(ProducerConfig.CLIENT_ID_CONFIG, "auth-service-producer");

        // JSON Serializer settings - GỬI type headers để Consumer deserialize chính xác
        configProps.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, true);
        configProps.put(JsonSerializer.TYPE_MAPPINGS,
            "emailEvent:com.boilerplate.auth.model.event.EmailEvent," +
            "supportTicketEvent:com.boilerplate.auth.model.event.SupportTicketEvent");

        log.info("Kafka Producer initialized with bootstrap servers: {}", bootstrapServers);

        return new DefaultKafkaProducerFactory<>(configProps);
    }

    /**
     * KafkaTemplate bean để gửi messages
     */
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        KafkaTemplate<String, Object> template = new KafkaTemplate<>(producerFactory());

        // Thêm observer để log thành công/thất bại
        template.setObservationEnabled(true);

        log.info("KafkaTemplate bean created successfully");
        return template;
    }
}

