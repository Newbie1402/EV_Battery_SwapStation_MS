package com.boilerplate.auth.security;

import com.boilerplate.auth.entity.User;
import com.boilerplate.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Service load thông tin user cho Spring Security
 * Hệ thống dùng OAuth2 - chỉ load user bằng email
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load user bằng email (parameter name vẫn là username để tuân thủ interface)
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy người dùng với email: " + email
                ));

        return new CustomUserDetails(user);
    }

    /**
     * Load user by ID
     */
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy người dùng với ID: " + id
                ));

        return new CustomUserDetails(user);
    }
}
