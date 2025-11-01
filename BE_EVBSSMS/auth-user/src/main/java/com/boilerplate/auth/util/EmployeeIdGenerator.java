package com.boilerplate.auth.util;

import com.boilerplate.auth.enums.Role;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

/**
 * Utility để sinh mã nhân viên theo quy tắc:
 * - DRIVER -> prefix EVD
 * - STAFF -> prefix EVS
 * - 6 chữ số: 2 chữ số ngẫu nhiên + 4 chữ số cuối là ddMM của ngày tạo
 */
public class EmployeeIdGenerator {

    private static final Random RANDOM = new Random();
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("ddMM");

    public static String generate(Role role, LocalDateTime createdAt) {
        if (role == null) throw new IllegalArgumentException("Role không được null");

        String prefix;
        if (role == Role.DRIVER) prefix = "EVD";
        else if (role == Role.STAFF) prefix = "EVS";
        else throw new IllegalArgumentException("Chỉ DRIVER và STAFF mới có mã nhân viên");

        String randomPart = String.format("%02d", RANDOM.nextInt(100)); // 2 chữ số
        String datePart = (createdAt != null) ? createdAt.format(DATE_FORMAT) : LocalDateTime.now().format(DATE_FORMAT);

        return prefix + randomPart + datePart; // Ví dụ: EVD120211 (EVD + 12 + 0211)
    }
}

