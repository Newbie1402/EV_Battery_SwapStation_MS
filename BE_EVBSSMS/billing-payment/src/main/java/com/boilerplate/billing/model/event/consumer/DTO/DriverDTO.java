package com.boilerplate.billing.model.event.consumer.DTO;

import com.boilerplate.billing.model.event.consumer.entity.Driver;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverDTO {
    private Long id;
    private String email;
    private String phone;
    private String fullName;
    private String birthday;      // từ service Auth trả "2025-11-16", kiểu String là OK
    private String address;
    private String identityCard;
    private String employeeId;

    public Driver toEntity() {
        LocalDate birthDate = null;
        if (this.birthday != null && !this.birthday.isEmpty()) {
            birthDate = LocalDate.parse(this.birthday, DateTimeFormatter.ISO_LOCAL_DATE);
        }

        return Driver.builder()
                .email(this.email)
                .phone(this.phone)
                .fullName(this.fullName)
                .birthday(birthDate)
                .address(this.address)
                .identityCard(this.identityCard)
                .employeeId(this.employeeId)
                .build();

    }

    public static DriverDTO fromEntity(Driver driver) {
        if (driver == null) return null;

        String birthStr = null;
        if (driver.getBirthday() != null) {
            birthStr = driver.getBirthday().format(DateTimeFormatter.ISO_LOCAL_DATE);
        }

        return DriverDTO.builder()
                .email(driver.getEmail())
                .phone(driver.getPhone())
                .fullName(driver.getFullName())
                .birthday(birthStr)
                .address(driver.getAddress())
                .identityCard(driver.getIdentityCard())
                .employeeId(driver.getEmployeeId())
                .build();
    }

}
