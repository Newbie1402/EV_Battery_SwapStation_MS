package com.boilerplate.auth.constant;

/**
 * Constants cho Kafka topics và consumer groups
 */
public final class KafkaConstants {

    private KafkaConstants() {
        throw new UnsupportedOperationException("Utility class");
    }

    // Topic names
    public static final String TOPIC_SUPPORT_TICKET_CREATED = "support.ticket.created";
    public static final String TOPIC_SUPPORT_TICKET_UPDATED = "support.ticket.updated";
    public static final String TOPIC_EMAIL_NOTIFICATION = "notification.email";

    // Consumer groups
    public static final String GROUP_AUTH_SERVICE = "auth-service-group";
    public static final String GROUP_STATION_SERVICE = "station-service-group";
    public static final String GROUP_NOTIFICATION_SERVICE = "notification-service-group";

    // Headers
    public static final String HEADER_EVENT_TYPE = "event-type";
    public static final String HEADER_EVENT_ID = "event-id";
    public static final String HEADER_EVENT_TIMESTAMP = "event-timestamp";
    public static final String HEADER_EVENT_SOURCE = "event-source";
    public static final String HEADER_CORRELATION_ID = "correlation-id";
}

