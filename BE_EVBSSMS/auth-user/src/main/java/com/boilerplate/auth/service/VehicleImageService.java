package com.boilerplate.auth.service;

import com.boilerplate.auth.exception.FileUploadException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

/**
 * Service xử lý upload ảnh xe lên AWS S3
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleImageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    private static final String VEHICLE_FOLDER = "vehicles/";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"};

    /**
     * Upload ảnh xe lên S3
     */
    public String uploadVehicleImage(MultipartFile file, String vehicleId) {
        validateFile(file);

        String fileName = generateFileName(file.getOriginalFilename(), vehicleId);
        String s3Key = VEHICLE_FOLDER + fileName;

        try {
            // Upload file lên S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Tạo URL public
            String imageUrl = String.format("https://%s.s3.%s.amazonaws.com/%s",
                    bucketName, region, s3Key);

            log.info("Uploaded vehicle image: vehicleId={}, url={}", vehicleId, imageUrl);
            return imageUrl;

        } catch (IOException e) {
            log.error("Failed to upload vehicle image: vehicleId={}", vehicleId, e);
            throw new FileUploadException("Không thể upload ảnh: " + e.getMessage());
        }
    }

    /**
     * Xóa ảnh xe khỏi S3
     */
    public void deleteVehicleImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }

        try {
            // Extract S3 key from URL
            String s3Key = extractS3KeyFromUrl(imageUrl);

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("Deleted vehicle image: url={}", imageUrl);

        } catch (Exception e) {
            log.error("Failed to delete vehicle image: url={}", imageUrl, e);
        }
    }

    /**
     * Validate file trước khi upload
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileUploadException("File không được để trống");
        }

        // Kiểm tra size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileUploadException("Kích thước file vượt quá 5MB");
        }

        // Kiểm tra extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new FileUploadException("Tên file không hợp lệ");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        boolean isValidExtension = false;
        for (String allowedExt : ALLOWED_EXTENSIONS) {
            if (extension.equals(allowedExt)) {
                isValidExtension = true;
                break;
            }
        }

        if (!isValidExtension) {
            throw new FileUploadException("Chỉ hỗ trợ file ảnh: .jpg, .jpeg, .png, .webp");
        }
    }

    /**
     * Generate tên file duy nhất
     */
    private String generateFileName(String originalFilename, String vehicleId) {
        String extension = getFileExtension(originalFilename);
        return vehicleId + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
    }

    /**
     * Lấy extension từ tên file
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            return filename.substring(lastDotIndex);
        }
        return "";
    }

    /**
     * Extract S3 key từ URL
     */
    private String extractS3KeyFromUrl(String imageUrl) {
        // URL format: https://bucket-name.s3.region.amazonaws.com/key
        String[] parts = imageUrl.split(".amazonaws.com/");
        if (parts.length == 2) {
            return parts[1];
        }
        throw new IllegalArgumentException("Invalid S3 URL format");
    }
}

