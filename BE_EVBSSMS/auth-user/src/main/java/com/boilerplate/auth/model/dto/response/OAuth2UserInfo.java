package com.boilerplate.auth.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO chứa thông tin người dùng từ Google OAuth2
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuth2UserInfo {

    /**
     * Google ID (sub claim)
     */
    private String googleId;

    /**
     * Email từ Google
     */
    private String email;

    /**
     * Họ và tên từ Google
     */
    private String fullName;

    /**
     * Tên hiển thị (name claim)
     */
    private String name;

    /**
     * URL ảnh đại diện từ Google
     */
    private String picture;

    /**
     * Tên (given_name)
     */
    private String firstName;

    /**
     * Họ (family_name)
     */
    private String lastName;

    /**
     * URL ảnh đại diện từ Google (alias)
     */
    private String avatar;

    /**
     * Email đã được xác thực bởi Google chưa
     */
    private Boolean emailVerified;
}
