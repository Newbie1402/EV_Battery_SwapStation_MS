package com.boilerplate.station.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class BatteryCodeGenerator {

    private static final String DIGITS = "0123456789";
    private static final SecureRandom random = new SecureRandom();

    /**
     * Generate battery code
     * Format: BTR + 6 digits
     * Example: BTR123456
     */
    public static String generateBatteryCode() {
        StringBuilder sb = new StringBuilder("BTR");
        for (int i = 0; i < 6; i++) {
            sb.append(DIGITS.charAt(random.nextInt(DIGITS.length())));
        }
        return sb.toString();
    }

    /**
     * Generate station code
     * Format: STT + 6 digits
     * Example: STT948201
     */
    public static String generateStationCode() {
        StringBuilder sb = new StringBuilder("STT");
        for (int i = 0; i < 6; i++) {
            sb.append(DIGITS.charAt(random.nextInt(DIGITS.length())));
        }
        return sb.toString();
    }
}
