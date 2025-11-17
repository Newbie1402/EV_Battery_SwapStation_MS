package com.boilerplate.bookingswap.service;

import com.boilerplate.bookingswap.enums.SubscriptionStatus;
import com.boilerplate.bookingswap.exception.NotFoundException;
import com.boilerplate.bookingswap.model.entity.PackagePlan;
import com.boilerplate.bookingswap.model.entity.UserPackageSubscription;
import com.boilerplate.bookingswap.model.dto.request.UserPackageSubscriptionRequest;
import com.boilerplate.bookingswap.model.dto.respone.UserPackageSubscriptionResponse;
import com.boilerplate.bookingswap.model.dto.respone.UserSubscriptionStatsResponse;
import com.boilerplate.bookingswap.repository.PackagePlanRepository;
import com.boilerplate.bookingswap.repository.UserPackageSubscriptionRepository;
import com.boilerplate.bookingswap.service.mapper.UserPackageSubscriptionMapper;
import com.boilerplate.bookingswap.service.mapper.PackagePlanMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý business logic cho UserPackageSubscription
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserPackageSubscriptionService {

    private final UserPackageSubscriptionRepository subscriptionRepository;
    private final PackagePlanRepository packagePlanRepository;
    private final UserPackageSubscriptionMapper subscriptionMapper;
    private final PackagePlanMapper packagePlanMapper;

    /**
     * Tạo đăng ký gói thuê pin mới
     */
    @Transactional
    public UserPackageSubscriptionResponse createSubscription(UserPackageSubscriptionRequest requestDTO) {
        log.info("Tạo đăng ký gói thuê pin mới cho user: {}", requestDTO.getUserId());

        // Kiểm tra user đã có gói đang hoạt động chưa
        if (subscriptionRepository.existsByUserIdAndStatus(requestDTO.getUserId(), SubscriptionStatus.ACTIVE)) {
            throw new IllegalStateException("User đã có gói thuê pin đang hoạt động");
        }

        // Lấy thông tin gói thuê
        PackagePlan packagePlan = packagePlanRepository.findById(requestDTO.getPackagePlanId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy gói thuê pin với ID: " + requestDTO.getPackagePlanId()));

        UserPackageSubscription subscription = subscriptionMapper.toEntity(requestDTO, packagePlan);
        // Set giá trị mặc định cho autoExtend là true khi tạo mới
        subscription.setAutoExtend(false);
        UserPackageSubscription savedSubscription = subscriptionRepository.save(subscription);

        log.info("Đã tạo đăng ký ID: {} cho user: {}",
                savedSubscription.getId(), savedSubscription.getUserId());

        return subscriptionMapper.toResponseDTO(savedSubscription);
    }

    /**
     * Lấy thông tin đăng ký theo ID
     */
    public UserPackageSubscriptionResponse getSubscriptionById(Long id) {
        log.debug("Lấy thông tin đăng ký ID: {}", id);

        UserPackageSubscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đăng ký với ID: " + id));

        return subscriptionMapper.toResponseDTO(subscription);
    }

    /**
     * Lấy đăng ký đang hoạt động của user
     */
    public UserPackageSubscriptionResponse getActiveSubscription(String userId) {
        log.debug("Lấy đăng ký đang hoạt động của user: {}", userId);

        UserPackageSubscription subscription = subscriptionRepository.findActiveSubscriptionByUserId(userId)
                .orElseThrow(() -> new NotFoundException("User không có gói đăng ký đang hoạt động"));

        return subscriptionMapper.toResponseDTO(subscription);
    }

    /**
     * Lấy lịch sử đăng ký của user
     */
    public Page<UserPackageSubscriptionResponse> getUserSubscriptionHistory(String userId, int page, int size) {
        log.debug("Lấy lịch sử đăng ký của user: {}", userId);

        Pageable pageable = PageRequest.of(page, size);
        Page<UserPackageSubscription> subscriptions =
                subscriptionRepository.findSubscriptionHistory(userId, pageable);

        return subscriptions.map(subscriptionMapper::toResponseDTO);
    }

    /**
     * Lấy thống kê đăng ký của user
     */
    public UserSubscriptionStatsResponse getUserSubscriptionStats(String userId) {
        log.debug("Lấy thống kê đăng ký của user: {}", userId);

        UserPackageSubscription activeSubscription = subscriptionRepository.findActiveSubscriptionByUserId(userId)
                .orElseThrow(() -> new NotFoundException("User không có gói đăng ký đang hoạt động"));

        PackagePlan packagePlan = activeSubscription.getPackagePlan();
        int remainingSwaps = packagePlan.getMaxSwapPerMonth() - activeSubscription.getUsedSwaps();
        long daysRemaining = ChronoUnit.DAYS.between(LocalDateTime.now(), activeSubscription.getEndDate());

        return UserSubscriptionStatsResponse.builder()
                .userId(userId)
                .subscriptionId(activeSubscription.getId())
                .packageName(packagePlan.getName())
                .packagePlan(packagePlanMapper.toResponseDTO(packagePlan))
                .autoExtend(activeSubscription.isAutoExtend())
                .maxSwapPerMonth(packagePlan.getMaxSwapPerMonth())
                .usedSwaps(activeSubscription.getUsedSwaps())
                .remainingSwaps(remainingSwaps)
                .startDate(activeSubscription.getStartDate())
                .endDate(activeSubscription.getEndDate())
                .daysRemaining(daysRemaining)
                .status(activeSubscription.getStatus().name())
                .build();
    }

    /**
     * Tăng số lần sử dụng đổi pin
     */
    @Transactional
    public void incrementUsedSwaps(Long subscriptionId) {
        log.info("Tăng số lần sử dụng cho đăng ký ID: {}", subscriptionId);

        UserPackageSubscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đăng ký với ID: " + subscriptionId));

        // Kiểm tra còn lượt sử dụng không
        if (subscription.getUsedSwaps() >= subscription.getPackagePlan().getMaxSwapPerMonth()) {
            throw new IllegalStateException("Đã hết lượt đổi pin trong gói");
        }

        int updated = subscriptionRepository.incrementUsedSwaps(subscriptionId);

        if (updated == 0) {
            throw new RuntimeException("Không thể cập nhật số lần sử dụng");
        }

        // Kiểm tra sau khi tăng, nếu đạt giới hạn thì chuyển sang OUT_OF_SWAPS
        subscription = subscriptionRepository.findById(subscriptionId).orElseThrow();
        if (subscription.getUsedSwaps() >= subscription.getPackagePlan().getMaxSwapPerMonth()) {
            subscription.setStatus(SubscriptionStatus.OUT_OF_SWAPS);
            subscription.setUpdatedAt(LocalDateTime.now());
            subscriptionRepository.save(subscription);
            log.info("Subscription ID: {} đã hết lượt, chuyển sang OUT_OF_SWAPS", subscriptionId);
        }

        log.info("Đã tăng số lần sử dụng cho đăng ký ID: {}", subscriptionId);
    }

    /**
     * Hủy đăng ký
     */
    @Transactional
    public UserPackageSubscriptionResponse cancelSubscription(Long id) {
        log.info("Hủy đăng ký ID: {}", id);

        UserPackageSubscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đăng ký với ID: " + id));

        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new IllegalStateException("Chỉ có thể hủy đăng ký đang hoạt động");
        }

        subscription.setStatus(SubscriptionStatus.INACTIVE);
        subscription.setUpdatedAt(LocalDateTime.now());

        UserPackageSubscription cancelledSubscription = subscriptionRepository.save(subscription);

        log.info("Đã hủy đăng ký ID: {}", id);

        return subscriptionMapper.toResponseDTO(cancelledSubscription);
    }

    /**
     * Lấy danh sách đăng ký sắp hết hạn (trong 7 ngày tới)
     */
    public List<UserPackageSubscriptionResponse> getExpiringSoonSubscriptions() {
        log.debug("Lấy danh sách đăng ký sắp hết hạn");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekLater = now.plusDays(7);

        List<UserPackageSubscription> expiringSubscriptions =
                subscriptionRepository.findExpiringSoonSubscriptions(now, weekLater);

        return expiringSubscriptions.stream()
                .map(subscriptionMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật trạng thái đăng ký hết hạn (Scheduled job)
     */
    @Transactional
    public void updateExpiredSubscriptions() {
        log.info("Cập nhật trạng thái đăng ký hết hạn");

        LocalDateTime now = LocalDateTime.now();
        List<UserPackageSubscription> expiredSubscriptions =
                subscriptionRepository.findExpiredSubscriptions(now);

        for (UserPackageSubscription subscription : expiredSubscriptions) {
            subscription.setStatus(SubscriptionStatus.EXPIRED);
            subscription.setUpdatedAt(now);
            subscriptionRepository.save(subscription);
        }

        log.info("Đã cập nhật {} đăng ký hết hạn", expiredSubscriptions.size());
    }

    /**
     * Cập nhật trạng thái thủ công
     */
    @Transactional
    public UserPackageSubscriptionResponse updateStatusManually(Long id, SubscriptionStatus newStatus) {
        log.info("Cập nhật trạng thái thủ công cho subscription ID: {} -> {}", id, newStatus);

        UserPackageSubscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đăng ký với ID: " + id));

        subscription.setStatus(newStatus);
        subscription.setUpdatedAt(LocalDateTime.now());

        UserPackageSubscription updated = subscriptionRepository.save(subscription);
        return subscriptionMapper.toResponseDTO(updated);
    }

    /**
     * Bật/tắt tự động gia hạn
     */
    @Transactional
    public UserPackageSubscriptionResponse toggleAutoExtend(Long id, boolean autoExtend) {
        log.info("Cập nhật autoExtend cho subscription ID: {} -> {}", id, autoExtend);

        UserPackageSubscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đăng ký với ID: " + id));

        subscription.setAutoExtend(autoExtend);
        subscription.setUpdatedAt(LocalDateTime.now());
        UserPackageSubscription saved = subscriptionRepository.save(subscription);
        return subscriptionMapper.toResponseDTO(saved);
    }

    /**
     * Gia hạn endDate của subscription dựa trên package type.
     * - Nếu endDate còn hiệu lực: gia hạn từ endDate hiện tại.
     * - Nếu đã hết hạn: gia hạn từ thời điểm hiện tại.
     * - periods < 1 sẽ được set = 1.
     * - Reset usedSwaps = 0 cho chu kỳ mới.
     * - Nếu status = EXPIRED sẽ chuyển về ACTIVE.
     * - Không cho gia hạn nếu PackagePlan đang INACTIVE.
     */
    @Transactional
    public UserPackageSubscriptionResponse extendEndDate(Long id, int periods) {
        log.info("Gia hạn endDate cho subscription ID: {} với số chu kỳ: {}", id, periods);

        UserPackageSubscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đăng ký với ID: " + id));

        PackagePlan plan = subscription.getPackagePlan();
        if (plan.getStatus() != com.boilerplate.bookingswap.enums.PackageStatus.ACTIVE) {
            throw new IllegalStateException("Không thể gia hạn do gói thuê pin đang INACTIVE");
        }

        if (periods < 1) periods = 1;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime base = subscription.getEndDate().isAfter(now) ? subscription.getEndDate() : now;
        LocalDateTime newEnd;
        switch (plan.getPackageType()) {
            case MONTHLY -> newEnd = base.plusMonths(periods);
            case YEARLY -> newEnd = base.plusYears(periods);
            default -> newEnd = base.plusMonths(periods);
        }

        subscription.setEndDate(newEnd);
        subscription.setUsedSwaps(0); // reset lượt sử dụng cho chu kỳ mới
        if (subscription.getStatus() == SubscriptionStatus.EXPIRED
                || subscription.getStatus() == SubscriptionStatus.OUT_OF_SWAPS) {
            subscription.setStatus(SubscriptionStatus.ACTIVE);
        }
        subscription.setUpdatedAt(now);

        UserPackageSubscription saved = subscriptionRepository.save(subscription);
        return subscriptionMapper.toResponseDTO(saved);
    }
}
