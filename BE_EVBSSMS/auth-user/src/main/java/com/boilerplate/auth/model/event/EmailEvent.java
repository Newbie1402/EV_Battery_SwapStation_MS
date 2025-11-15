package com.boilerplate.auth.model.event;

import com.boilerplate.auth.enums.OtpType;
import java.io.Serial;
import lombok.*;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * Event để gửi email qua Kafka
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Accessors(chain = true)
public class EmailEvent implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String to;
    private String subject;
    private String body;
    private String otpCode;
    private OtpType otpType;
}

