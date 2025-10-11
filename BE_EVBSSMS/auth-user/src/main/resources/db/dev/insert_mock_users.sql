-- Insert mock users với các role khác nhau
INSERT INTO users (id, email, full_name, role, status, is_active, is_verified, created_at, updated_at)
VALUES
    (1, 'driver1@test.com', 'Test Driver 1', 'DRIVER', 'ACTIVE', true, true, NOW(), NOW()),
    (2, 'driver2@test.com', 'Test Driver 2', 'DRIVER', 'ACTIVE', true, true, NOW(), NOW()),
    (3, 'staff1@test.com', 'Test Staff 1', 'STAFF', 'ACTIVE', true, true, NOW(), NOW()),
    (4, 'admin1@test.com', 'Test Admin 1', 'ADMIN', 'ACTIVE', true, true, NOW(), NOW()),
    (5, 'driver3@test.com', 'Test Driver 3', 'DRIVER', 'ACTIVE', true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        is_active = EXCLUDED.is_active,
        is_verified = EXCLUDED.is_verified,
        updated_at = NOW();

-- Reset sequence để tránh conflict với ID đã insert
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Hiển thị kết quả
SELECT id, email, full_name, role, status FROM users WHERE id <= 5;

-- ĐÂY LÀ DỮ LIỆU MOCK, TẠI LƯỜI AI CẦN THÌ DÙNG KO CẦN THÌ KO CẦN CHẠY CÁI NÀY PHẢI CHẠY THỦ CÔNG NHA CÀI PLUCGIN VÀO THÌ CÓ THỂ RUN TRỰC TIẾP Ở TRÊN IDE

