package com.boilerplate.bookingswap.service;

import com.boilerplate.bookingswap.enums.TransactionStatus;
import com.boilerplate.bookingswap.exception.NotFoundException;
import com.boilerplate.bookingswap.model.entity.BatterySwapTransaction;
import com.boilerplate.bookingswap.model.dto.request.BatterySwapTransactionRequest;
import com.boilerplate.bookingswap.model.dto.respone.BatterySwapTransactionResponse;
import com.boilerplate.bookingswap.repository.BatterySwapTransactionRepository;
import com.boilerplate.bookingswap.service.mapper.BatterySwapTransactionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý business logic cho BatterySwapTransaction
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BatterySwapTransactionService {

    private final BatterySwapTransactionRepository transactionRepository;
    private final BatterySwapTransactionMapper transactionMapper;

    /**
     * Tạo giao dịch đổi pin mới
     * @param requestDTO Thông tin giao dịch
     * @return Giao dịch đã tạo
     */
    @Transactional
    public BatterySwapTransactionResponse createTransaction(BatterySwapTransactionRequest requestDTO) {
        log.info("Tạo giao dịch đổi pin mới cho booking: {}", requestDTO.getBookingId());

        // Kiểm tra booking đã có giao dịch chưa
        if (transactionRepository.findByBookingId(requestDTO.getBookingId()).isPresent()) {
            throw new IllegalStateException("Booking này đã có giao dịch");
        }

        BatterySwapTransaction transaction = transactionMapper.toEntity(requestDTO);
        BatterySwapTransaction savedTransaction = transactionRepository.save(transaction);

        log.info("Đã tạo giao dịch ID: {} cho booking: {}",
                savedTransaction.getId(), savedTransaction.getBookingId());

        return transactionMapper.toResponseDTO(savedTransaction);
    }

    /**
     * Lấy thông tin giao dịch theo ID
     * @param id ID giao dịch
     * @return Thông tin giao dịch
     */
    public BatterySwapTransactionResponse getTransactionById(Long id) {
        log.debug("Lấy thông tin giao dịch ID: {}", id);

        BatterySwapTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy giao dịch với ID: " + id));

        return transactionMapper.toResponseDTO(transaction);
    }

    /**
     * Lấy giao dịch theo booking ID
     * @param bookingId ID booking
     * @return Thông tin giao dịch
     */
    public BatterySwapTransactionResponse getTransactionByBookingId(String bookingId) {
        log.debug("Lấy giao dịch theo booking ID: {}", bookingId);

        BatterySwapTransaction transaction = transactionRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy giao dịch cho booking: " + bookingId));

        return transactionMapper.toResponseDTO(transaction);
    }

    /**
     * Lấy tất cả giao dịch của tài xế
     * @param driverId ID tài xế
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách giao dịch
     */
    public Page<BatterySwapTransactionResponse> getDriverTransactions(String driverId, int page, int size) {
        log.debug("Lấy danh sách giao dịch của tài xế: {}", driverId);

        Pageable pageable = PageRequest.of(page, size);
        Page<BatterySwapTransaction> transactions = transactionRepository.findByDriverId(driverId, pageable);

        return transactions.map(transactionMapper::toResponseDTO);
    }

    /**
     * Lấy tất cả giao dịch tại trạm
     * @param stationId ID trạm
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách giao dịch
     */
    public Page<BatterySwapTransactionResponse> getStationTransactions(String stationId, int page, int size) {
        log.debug("Lấy danh sách giao dịch tại trạm: {}", stationId);

        Pageable pageable = PageRequest.of(page, size);
        Page<BatterySwapTransaction> transactions = transactionRepository.findByStationId(stationId, pageable);

        return transactions.map(transactionMapper::toResponseDTO);
    }

    /**
     * Xác nhận giao dịch (chuyển sang PROCESSING)
     * @param id ID giao dịch
     * @return Giao dịch đã cập nhật
     */
    @Transactional
    public BatterySwapTransactionResponse processTransaction(Long id) {
        log.info("Xử lý giao dịch ID: {}", id);

        BatterySwapTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy giao dịch với ID: " + id));

        if (transaction.getTransactionStatus() != TransactionStatus.PENDING) {
            throw new IllegalStateException("Chỉ có thể xử lý giao dịch đang chờ");
        }

        transaction.setTransactionStatus(TransactionStatus.SUCCESS);
        BatterySwapTransaction updatedTransaction = transactionRepository.save(transaction);

        log.info("Đã chuyển giao dịch ID: {} sang trạng thái SUCCESS", id);

        return transactionMapper.toResponseDTO(updatedTransaction);
    }

    /**
     * Hoàn thành giao dịch
     * @param id ID giao dịch
     * @return Giao dịch đã hoàn thành
     */
    @Transactional
    public BatterySwapTransactionResponse completeTransaction(Long id) {
        log.info("Hoàn thành giao dịch ID: {}", id);

        BatterySwapTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy giao dịch với ID: " + id));

        if (transaction.getTransactionStatus() == TransactionStatus.SUCCESS) {
            throw new IllegalStateException("Giao dịch đã hoàn thành trước đó");
        }

        transaction.setTransactionStatus(TransactionStatus.SUCCESS);
        BatterySwapTransaction completedTransaction = transactionRepository.save(transaction);

        log.info("Đã hoàn thành giao dịch ID: {}", id);

        return transactionMapper.toResponseDTO(completedTransaction);
    }

    /**
     * Hủy giao dịch
     * @param id ID giao dịch
     * @return Giao dịch đã hủy
     */
    @Transactional
    public BatterySwapTransactionResponse failTransaction(Long id) {
        log.info("Đánh dấu giao dịch thất bại ID: {}", id);

        BatterySwapTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy giao dịch với ID: " + id));

        transaction.setTransactionStatus(TransactionStatus.FAILED);
        BatterySwapTransaction failedTransaction = transactionRepository.save(transaction);

        log.info("Đã đánh dấu giao dịch ID: {} thất bại", id);

        return transactionMapper.toResponseDTO(failedTransaction);
    }

    /**
     * Tính tổng chi tiêu của tài xế
     * @param driverId ID tài xế
     * @return Tổng chi tiêu
     */
    public BigDecimal calculateDriverTotalSpending(String driverId) {
        log.debug("Tính tổng chi tiêu của tài xế: {}", driverId);

        BigDecimal total = transactionRepository.calculateTotalAmountByDriverId(driverId);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * Tính tổng doanh thu của trạm
     * @param stationId ID trạm
     * @return Tổng doanh thu
     */
    public BigDecimal calculateStationRevenue(String stationId) {
        log.debug("Tính tổng doanh thu của trạm: {}", stationId);

        BigDecimal revenue = transactionRepository.calculateTotalAmountByStationId(stationId);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    /**
     * Lấy lịch sử đổi pin của một viên pin
     * @param batteryId ID pin
     * @return Danh sách giao dịch
     */
    public List<BatterySwapTransactionResponse> getBatterySwapHistory(String batteryId) {
        log.debug("Lấy lịch sử đổi pin của battery: {}", batteryId);

        List<BatterySwapTransaction> history = transactionRepository.findBatterySwapHistory(batteryId);

        return history.stream()
                .map(transactionMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy các giao dịch bị kẹt (stuck transactions)
     * @return Danh sách giao dịch
     */
    public List<BatterySwapTransactionResponse> getStuckTransactions() {
        log.debug("Lấy danh sách giao dịch bị kẹt");

        LocalDateTime beforeTime = LocalDateTime.now().minusHours(2); // Giao dịch đang xử lý quá 2h
        List<BatterySwapTransaction> stuckTransactions =
                transactionRepository.findStuckTransactions(TransactionStatus.PENDING, beforeTime);

        return stuckTransactions.stream()
                .map(transactionMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}

