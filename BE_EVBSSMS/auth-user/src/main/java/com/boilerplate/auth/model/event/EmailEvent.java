package com.boilerplate.auth.model.event;

import com.boilerplate.auth.enums.OtpType;
import lombok.*;

import java.io.Serializable;

/**
 * Event để gửi email qua Kafka
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String to;
    private String subject;
    private String body;
    private String otpCode;
    private OtpType otpType;
}

