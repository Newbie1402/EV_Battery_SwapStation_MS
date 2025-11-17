package com.boilerplate.billing.model.DTO;

import com.boilerplate.billing.model.entity.Driver;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverDTO {

    private Long id;
    private String email;
    private String phone;
    private String fullName;
    private LocalDate birthday;
    private String address;
    private String identityCard;
    private Long assignedStationId;
    private String employeeId;

    // ============================
    //       FROM ENTITY
    // ============================
    public static DriverDTO fromEntity(Driver driver) {
        if (driver == null) return null;

        return DriverDTO.builder()
                .id(driver.getId())
                .email(driver.getEmail())
                .phone(driver.getPhone())
                .fullName(driver.getFullName())
                .birthday(driver.getBirthday())
                .address(driver.getAddress())
                .identityCard(driver.getIdentityCard())
                .assignedStationId(driver.getAssignedStationId())
                .employeeId(driver.getEmployeeId())
                .build();
    }

    // ============================
    //         TO ENTITY
    // ============================
    public Driver toEntity() {
        return Driver.builder()
                .id(this.id)
                .email(this.email)
                .phone(this.phone)
                .fullName(this.fullName)
                .birthday(this.birthday)
                .address(this.address)
                .identityCard(this.identityCard)
                .assignedStationId(this.assignedStationId)
                .employeeId(this.employeeId)
                .build();
    }
}
