package com.boilerplate.bookingswap.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO nhận dữ liệu yêu cầu hoàn thành booking
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCompleteRequest {

    /** ID thanh toán */
    @NotNull(message = "Payment ID không được để trống")
    private Long paymentId;
}

