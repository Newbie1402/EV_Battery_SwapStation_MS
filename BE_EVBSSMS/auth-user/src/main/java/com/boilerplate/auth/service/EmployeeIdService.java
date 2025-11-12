package com.boilerplate.auth.service;

import com.boilerplate.auth.entity.User;
import com.boilerplate.auth.repository.UserRepository;
import com.boilerplate.auth.util.EmployeeIdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service đảm nhiệm việc sinh và gán mã nhân viên cho User nếu eligible (DRIVER/STAFF)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeIdService {

    private final UserRepository userRepository;

    /**
     * Nếu user có role DRIVER hoặc STAFF và chưa có employeeId thì sinh và gán.
     * Kiểm tra uniqueness, thử tối đa 10 lần.
     */
    @Transactional
    public void assignIfEligible(User user) {
        if (user == null) return;
        if (user.getRole() == null) return;
        if (!(user.getRole().name().equals("DRIVER") || user.getRole().name().equals("STAFF"))) return;
        if (user.getEmployeeId() != null && !user.getEmployeeId().isEmpty()) return;

        int maxAttempts = 10;
        for (int i = 0; i < maxAttempts; i++) {
            String candidate = EmployeeIdGenerator.generate(user.getRole(),
                    user.getCreatedAt() != null ? user.getCreatedAt() : LocalDateTime.now());
            if (!userRepository.existsByEmployeeId(candidate)) {
                user.setEmployeeId(candidate);
                userRepository.save(user);
                log.info("Đã gán employeeId={} cho userId={}", candidate, user.getId());
                return;
            }
        }

        log.warn("Không thể gán employeeId duy nhất cho userId={} sau {} lần thử", user.getId(), maxAttempts);
    }
}

