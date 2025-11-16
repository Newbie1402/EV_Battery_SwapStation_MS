package com.boilerplate.auth.model.dto.response;

import com.boilerplate.auth.enums.Role;
import com.boilerplate.auth.enums.UserStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO chứa thông tin người dùng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {

    private Long id;
    private String email;
    private String phone;
    private String fullName;
    private LocalDate birthday;
    private String avatar;
    private Role role;
    private String address;
    private String identityCard;
    private Boolean isVerified;
    private Boolean isActive;
    private UserStatus status;
    private String employeeId;
    private List<VehicleResponse> vehicles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
