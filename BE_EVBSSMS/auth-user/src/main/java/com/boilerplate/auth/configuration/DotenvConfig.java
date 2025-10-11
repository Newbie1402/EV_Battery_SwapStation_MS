package com.boilerplate.auth.configuration;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * Configuration để load file .env vào Spring Environment
 * File .env phải nằm ở thư mục gốc của project
 */
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        try {
            // Xác định đường dẫn chính xác đến file .env
            String currentDir = System.getProperty("user.dir");
            log.info("Current directory: {}", currentDir);

            // Tìm file .env trực tiếp
            String[] searchPaths = {
                    "./",
                    "../",
                    "../../",
                    "../../../",
                    currentDir + "/",
                    currentDir + "/../"
            };

            Dotenv dotenv = null;
            String envFilePath = null;

            for (String path : searchPaths) {
                File envFile = new File(path + ".env");
                if (envFile.exists()) {
                    log.info("Tìm thấy file .env tại: {}", envFile.getAbsolutePath());
                    envFilePath = path;
                    break;
                }
            }

            // Load file .env nếu tìm thấy
            if (envFilePath != null) {
                dotenv = Dotenv.configure()
                        .directory(envFilePath)
                        .ignoreIfMalformed()
                        .load();
            } else {
                log.warn("Không tìm thấy file .env trong các đường dẫn đã tìm kiếm. Sẽ sử dụng cấu hình từ application.yml");
                return;
            }

            if (dotenv.entries().isEmpty()) {
                log.warn("⚠File .env trống hoặc không đọc được. Sẽ sử dụng cấu hình từ application.yml");
                return;
            }

            ConfigurableEnvironment environment = applicationContext.getEnvironment();
            MutablePropertySources propertySources = environment.getPropertySources();

            // Chuyển đổi các biến từ .env thành Map
            Map<String, Object> dotenvMap = new HashMap<>();
            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();

                // Load TẤT CẢ các biến môi trường
                dotenvMap.put(key, value);

                // Đặc biệt cho OAuth2, cũng map biến dưới dạng spring.security.*
                if (key.equals("GOOGLE_CLIENT_ID")) {
                    dotenvMap.put("spring.security.oauth2.client.registration.google.client-id", value);
                    log.debug("Mapped GOOGLE_CLIENT_ID to spring.security.oauth2.client.registration.google.client-id");
                }
                if (key.equals("GOOGLE_CLIENT_SECRET")) {
                    dotenvMap.put("spring.security.oauth2.client.registration.google.client-secret", value);
                    log.debug("Mapped GOOGLE_CLIENT_SECRET to spring.security.oauth2.client.registration.google.client-secret");
                }

                // Log nhưng ẩn các giá trị nhạy cảm
                boolean isSensitive = key.contains("SECRET") || key.contains("PASSWORD")
                        || key.contains("KEY") || key.contains("TOKEN");

                // Log chi tiết để debug
                if (key.equals("GOOGLE_CLIENT_ID") || key.equals("GOOGLE_CLIENT_SECRET")) {
                    log.info("Loaded OAuth2 env variable: {} = {}", key, isSensitive ? "***" : value);
                }
            });

            if (dotenvMap.isEmpty()) {
                log.warn("Không có biến môi trường nào được load từ .env");
                return;
            }

            // Thêm vào Spring Environment với priority CAO NHẤT để override mọi config khác
            propertySources.addFirst(new MapPropertySource("dotenvProperties", dotenvMap));

            // Verify rằng GOOGLE_CLIENT_ID đã được add vào environment
            String googleClientId = environment.getProperty("GOOGLE_CLIENT_ID");
            String springGoogleClientId = environment.getProperty("spring.security.oauth2.client.registration.google.client-id");

            if (googleClientId != null) {
                log.info("Đã xác nhận GOOGLE_CLIENT_ID được load thành công: {}", googleClientId.substring(0, 10) + "...");
            } else {
                log.error("GOOGLE_CLIENT_ID KHÔNG được load vào Spring Environment!");
            }

            if (springGoogleClientId != null) {
                log.info("Đã xác nhận spring.security.oauth2.client.registration.google.client-id được map thành công");
            } else {
                log.error("spring.security.oauth2.client.registration.google.client-id KHÔNG được map!");
            }

            log.info("Đã load {} biến môi trường từ file .env", dotenvMap.size());

        } catch (Exception e) {
            log.error("LỖI khi load file .env: {}", e.getMessage(), e);
            log.warn("Sẽ sử dụng cấu hình từ application.yml");
        }
    }
}
