package com.boilerplate.billing.client.url;

import com.boilerplate.billing.client.BookingClient;
import com.boilerplate.billing.model.response.ResponseData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test/booking")
@RequiredArgsConstructor
public class BookingTestController {

    private final BookingClient bookingClient;

    /**
     * Test gọi PUT sang Booking Service
     * Không có body, chỉ truyền id
     */
    @PutMapping("/{id}")
    public ResponseEntity<ResponseData<Void>> testConfirmBooking(@PathVariable("id") Long id) {
        ResponseData<Void> response = bookingClient.updateBookingStatus(id);
        return ResponseEntity.ok(response);
    }
}
