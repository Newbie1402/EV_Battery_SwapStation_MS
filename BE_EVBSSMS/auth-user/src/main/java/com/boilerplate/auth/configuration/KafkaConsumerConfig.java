package com.boilerplate.auth.configuration;

import com.boilerplate.auth.model.event.EmailEvent;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka Consumer Configuration cho Auth Service
 *
 * Xử lý:
 * - EmailEvent từ email-topic
 * - ErrorHandlingDeserializer để xử lý lỗi deserialize
 * - Trusted packages cho JsonDeserializer
 */
@Configuration
@Slf4j
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id:auth-user-service}")
    private String groupId;

    @Value("${spring.kafka.consumer.auto-offset-reset:earliest}")
    private String autoOffsetReset;

    @Value("${spring.kafka.consumer.enable-auto-commit:false}")
    private Boolean enableAutoCommit;

    @Value("${spring.kafka.consumer.max-poll-records:500}")
    private Integer maxPollRecords;

    /**
     * Cấu hình Consumer Factory với ErrorHandlingDeserializer
     */
    @Bean
    public ConsumerFactory<String, EmailEvent> emailEventConsumerFactory() {
        Map<String, Object> configProps = new HashMap<>();

        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        configProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, autoOffsetReset);
        configProps.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, enableAutoCommit);
        configProps.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, maxPollRecords);
        configProps.put(ConsumerConfig.CLIENT_ID_CONFIG, "auth-service-consumer");

        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);

        configProps.put(ErrorHandlingDeserializer.KEY_DESERIALIZER_CLASS, StringDeserializer.class);
        configProps.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);

        configProps.put(JsonDeserializer.TRUSTED_PACKAGES, "com.boilerplate.auth.model.event");
        configProps.put(JsonDeserializer.VALUE_DEFAULT_TYPE, EmailEvent.class.getName());
        configProps.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);

        log.info("Kafka EmailEvent Consumer initialized with bootstrap servers: {}", bootstrapServers);

        return new DefaultKafkaConsumerFactory<>(
            configProps,
            new StringDeserializer(),
            new JsonDeserializer<>(EmailEvent.class)
        );
    }

    /**
     * Container Factory cho Email Event Listener
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, EmailEvent> emailEventKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, EmailEvent> factory =
            new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(emailEventConsumerFactory());
        factory.setConcurrency(3);
        factory.getContainerProperties().setPollTimeout(3000);

        log.info("Email Event Kafka Listener Container Factory created");

        return factory;
    }
}

