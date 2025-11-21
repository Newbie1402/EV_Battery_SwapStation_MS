package com.boilerplate.bookingswap.service;

import com.boilerplate.bookingswap.enums.BookingStatus;
import com.boilerplate.bookingswap.exception.BookingException;
import com.boilerplate.bookingswap.exception.BusinessException;
import com.boilerplate.bookingswap.exception.NotFoundException;
import com.boilerplate.bookingswap.model.entity.Booking;
import com.boilerplate.bookingswap.model.dto.request.BookingRequest;
import com.boilerplate.bookingswap.model.dto.request.BookingSearchRequest;
import com.boilerplate.bookingswap.model.dto.request.BookingUpdateRequest;
import com.boilerplate.bookingswap.model.dto.respone.BookingResponse;
import com.boilerplate.bookingswap.model.dto.respone.BookingStatisticsResponse;
import com.boilerplate.bookingswap.model.response.ResponseData;
import com.boilerplate.bookingswap.repository.BookingRepository;
import com.boilerplate.bookingswap.service.mapper.BookingMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý business logic cho Booking
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;

    /**
     * Tạo booking mới
     * @param requestDTO Thông tin booking
     * @return Booking đã tạo
     */
    @Transactional
    public BookingResponse createBooking(BookingRequest requestDTO) {
        log.info("Tạo booking mới cho tài xế: {}", requestDTO.getDriverId());

        // Kiểm tra tài xế có booking đang chờ xử lý không
        if (bookingRepository.existsByDriverIdAndBookingStatus(
                requestDTO.getDriverId(), BookingStatus.PENDING)) {
            throw new IllegalStateException("Tài xế đã có booking đang chờ xử lý");
        }

        Booking booking = bookingMapper.toEntity(requestDTO);
        Booking savedBooking = bookingRepository.save(booking);

        log.info("Đã tạo booking ID: {} cho tài xế: {}",
                savedBooking.getId(), savedBooking.getDriverId());

        return bookingMapper.toResponseDTO(savedBooking);
    }

    /**
     * Lấy tất cả booking với phân trang
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách booking
     */
    public Page<BookingResponse> getAllBookings(int page, int size) {
        log.debug("Lấy tất cả booking");

        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = bookingRepository.findAll(pageable);

        return bookings.map(bookingMapper::toResponseDTO);
    }

    /**
     * Lấy thông tin booking theo ID
     * @param id ID booking
     * @return Thông tin booking
     */
    public BookingResponse getBookingById(Long id) {
        log.debug("Lấy thông tin booking ID: {}", id);

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với ID: " + id));

        return bookingMapper.toResponseDTO(booking);
    }

    /**
     * Lấy tất cả booking của tài xế
     * @param driverId ID tài xế
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách booking
     */
    public Page<BookingResponse> getDriverBookings(String driverId, int page, int size) {
        log.debug("Lấy danh sách booking của tài xế: {}", driverId);

        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = bookingRepository.findByDriverId(driverId, pageable);

        return bookings.map(bookingMapper::toResponseDTO);
    }

    /**
     * Lấy tất cả booking tại trạm
     * @param stationId ID trạm
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách booking
     */
    public Page<BookingResponse> getStationBookings(String stationId, int page, int size) {
        log.debug("Lấy danh sách booking tại trạm: {}", stationId);

        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = bookingRepository.findByStationId(stationId, pageable);

        return bookings.map(bookingMapper::toResponseDTO);
    }

    /**
     * Cập nhật booking
     * @param id ID booking
     * @param updateDTO Thông tin cập nhật
     * @return Booking đã cập nhật
     */
    @Transactional
    public BookingResponse updateBooking(Long id, BookingUpdateRequest updateDTO) {
        log.info("Cập nhật booking ID: {}", id);

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với ID: " + id));

        bookingMapper.updateEntityFromDTO(booking, updateDTO);
        Booking updatedBooking = bookingRepository.save(booking);

        log.info("Đã cập nhật booking ID: {}", id);

        return bookingMapper.toResponseDTO(updatedBooking);
    }

    /**
     * Hủy booking
     * @param id ID booking
     * @param cancelReason Lý do hủy
     * @return Booking đã hủy
     */
    @Transactional
    public BookingResponse cancelBooking(Long id, String cancelReason) {
        log.info("Hủy booking ID: {}", id);

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với ID: " + id));

        if (booking.getBookingStatus() == BookingStatus.SUCCESS) {
            throw new IllegalStateException("Không thể hủy booking đã hoàn thành");
        }

        if (booking.getBookingStatus() == BookingStatus.CANCEL) {
            throw new IllegalStateException("Booking đã bị hủy trước đó");
        }

        booking.setBookingStatus(BookingStatus.CANCEL);
        booking.setNotes(cancelReason);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking cancelledBooking = bookingRepository.save(booking);

        log.info("Đã hủy booking ID: {}", id);

        return bookingMapper.toResponseDTO(cancelledBooking);
    }

    /**
     * Xác nhận booking
     * @param id ID booking
     * @return Booking đã xác nhận
     */
    @Transactional
    public BookingResponse confirmBooking(Long id) {
        log.info("Xác nhận booking ID: {}", id);

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với ID: " + id));

        if (booking.getBookingStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Chỉ có thể xác nhận booking đang chờ xử lý");
        }

        booking.setBookingStatus(BookingStatus.CONFIRM);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking confirmedBooking = bookingRepository.save(booking);

        log.info("Đã xác nhận booking ID: {}", id);

        return bookingMapper.toResponseDTO(confirmedBooking);
    }

    /**
     * Hoàn thành booking
     * @param id ID booking
     * @param paymentId ID thanh toán
     * @return Booking đã hoàn thành
     */
    @Transactional
    public BookingResponse completeBooking(Long id, Long paymentId) {
        log.info("Hoàn thành booking ID: {}", id);

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với ID: " + id));

        if (booking.getBookingStatus() != BookingStatus.CONFIRM) {
            throw new IllegalStateException("Chỉ có thể hoàn thành booking đã xác nhận");
        }

        booking.setBookingStatus(BookingStatus.SUCCESS);
        booking.setPaymentId(paymentId);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking completedBooking = bookingRepository.save(booking);

        log.info("Đã hoàn thành booking ID: {}", id);

        return bookingMapper.toResponseDTO(completedBooking);
    }

    /**
     * Tìm kiếm booking với nhiều điều kiện
     * @param searchDTO Điều kiện tìm kiếm
     * @return Danh sách booking
     */
    public Page<BookingResponse> searchBookings(BookingSearchRequest searchDTO) {
        log.debug("Tìm kiếm booking với điều kiện: {}", searchDTO);

        Pageable pageable = PageRequest.of(searchDTO.getPage(), searchDTO.getSize());

        BookingStatus status = null;
        if (searchDTO.getBookingStatus() != null) {
            status = BookingStatus.valueOf(searchDTO.getBookingStatus());
        }

        Page<Booking> bookings = bookingRepository.searchBookings(
                searchDTO.getDriverId(),
                searchDTO.getStationId(),
                status,
                searchDTO.getStartDate(),
                searchDTO.getEndDate(),
                pageable
        );

        return bookings.map(bookingMapper::toResponseDTO);
    }

    /**
     * Lấy booking sắp diễn ra (trong 24h tới)
     * @return Danh sách booking
     */
    public List<BookingResponse> getUpcomingBookings() {
        log.debug("Lấy danh sách booking sắp diễn ra");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime future = now.plusHours(24);

        List<Booking> upcomingBookings = bookingRepository.findUpcomingBookings(now, future);

        return upcomingBookings.stream()
                .map(bookingMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy booking quá hạn chưa hoàn thành
     * @return Danh sách booking
     */
    public List<BookingResponse> getOverdueBookings() {
        log.debug("Lấy danh sách booking quá hạn");

        LocalDateTime now = LocalDateTime.now();
        List<Booking> overdueBookings = bookingRepository.findOverdueBookings(now);

        return overdueBookings.stream()
                .map(bookingMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Thống kê booking theo ngày
     * @param date Ngày cần thống kê
     * @return Thống kê
     */
    public BookingStatisticsResponse getBookingStatistics(LocalDate date) {
        log.debug("Thống kê booking cho ngày: {}", date);

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();

        Long totalBookings = bookingRepository.countBookingsByStatusAndDateRange(
                startOfDay, endOfDay, null);
        Long pendingBookings = bookingRepository.countBookingsByStatusAndDateRange(
                startOfDay, endOfDay, BookingStatus.PENDING);
        Long confirmedBookings = bookingRepository.countBookingsByStatusAndDateRange(
                startOfDay, endOfDay, BookingStatus.CONFIRM);
        Long completedBookings = bookingRepository.countBookingsByStatusAndDateRange(
                startOfDay, endOfDay, BookingStatus.SUCCESS);
        Long cancelledBookings = bookingRepository.countBookingsByStatusAndDateRange(
                startOfDay, endOfDay, BookingStatus.CANCEL);

        double completionRate = totalBookings > 0
                ? (completedBookings * 100.0) / totalBookings : 0;
        double cancellationRate = totalBookings > 0
                ? (cancelledBookings * 100.0) / totalBookings : 0;

        return BookingStatisticsResponse.builder()
                .date(date)
                .totalBookings(totalBookings)
                .pendingBookings(pendingBookings)
                .confirmedBookings(confirmedBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .completionRate(completionRate)
                .cancellationRate(cancellationRate)
                .build();
    }

    /**
     * Xóa booking
     * @param id ID booking
     */
    @Transactional
    public void deleteBooking(Long id) {
        log.info("Xóa booking ID: {}", id);

        if (!bookingRepository.existsById(id)) {
            throw new NotFoundException("Không tìm thấy booking với ID: " + id);
        }

        bookingRepository.deleteById(id);

        log.info("Đã xóa booking ID: {}", id);
    }

    public ResponseEntity<ResponseData<Void>> confirmIsPaid(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BusinessException(BookingException.BOOKING_NOT_FOUND));

        booking.setPaid(true);
        bookingRepository.save(booking);
        return ResponseEntity.ok(
                new ResponseData<>(
                        200,
                        "Xác nhận thanh toán thành công",
                        null
                )
        );
    }
}

