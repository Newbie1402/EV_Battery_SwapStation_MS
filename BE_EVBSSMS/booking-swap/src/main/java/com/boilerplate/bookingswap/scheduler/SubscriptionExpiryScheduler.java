package com.boilerplate.bookingswap.scheduler;

import com.boilerplate.bookingswap.service.UserPackageSubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler định kỳ kiểm tra và cập nhật các subscription đã hết hạn sang EXPIRED.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionExpiryScheduler {

    private final UserPackageSubscriptionService subscriptionService;

    /**
     * Chạy mỗi 5 phút để cập nhật các subscription đã hết hạn.
     * - fixedDelay: 5 phút tính từ khi job trước kết thúc
     */
    @Scheduled(fixedDelay = 5 * 60 * 1000)
    public void updateExpiredSubscriptionsJob() {
        try {
            log.debug("Chạy job cập nhật subscription hết hạn");
            subscriptionService.updateExpiredSubscriptions();
        } catch (Exception ex) {
            log.error("Lỗi khi cập nhật subscription hết hạn", ex);
        }
    }
}

