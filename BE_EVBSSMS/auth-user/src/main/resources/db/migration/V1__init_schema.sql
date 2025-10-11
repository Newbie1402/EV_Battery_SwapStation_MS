-- Migration V1: Tạo schema ban đầu cho Auth-User Service
-- Author: System
-- Date: 2025-10-11
-- Description: Tạo các bảng users, vehicles, otp_tokens, refresh_tokens cho hệ thống OAuth2

-- ==== 1. Bảng USERS ====
-- Lưu trữ thông tin người dùng (Driver, Staff, Admin)
-- Sử dụng OAuth2 (Google Login) - không có username/password
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,

    -- OAuth2 Fields
    google_id VARCHAR(100) UNIQUE,
    oauth_id VARCHAR(100),
    oauth_provider VARCHAR(20),

    -- Basic Info
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    full_name VARCHAR(100) NOT NULL,
    birthday DATE,
    avatar VARCHAR(500),

    -- Role & Permissions
    role VARCHAR(20) NOT NULL,
    address VARCHAR(255),
    identity_card VARCHAR(20) UNIQUE,

    -- Account Status
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',
    rejection_reason TEXT,

    -- Staff Assignment
    assigned_station_id BIGINT,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_role CHECK (role IN ('DRIVER', 'STAFF', 'ADMIN')),
    CONSTRAINT chk_status CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'REJECTED'))
);

-- Indexes cho performance
CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_oauth ON users(oauth_id, oauth_provider);
CREATE INDEX IF NOT EXISTS idx_role ON users(role);

-- Comments
COMMENT ON TABLE users IS 'Bảng lưu trữ thông tin người dùng - sử dụng OAuth2 (Google Login)';
COMMENT ON COLUMN users.google_id IS 'Google ID từ OAuth2';
COMMENT ON COLUMN users.oauth_id IS 'OAuth ID từ provider (Google, Facebook, etc.)';
COMMENT ON COLUMN users.oauth_provider IS 'OAuth Provider (GOOGLE, FACEBOOK, etc.)';
COMMENT ON COLUMN users.email IS 'Email - identifier chính cho OAuth2';
COMMENT ON COLUMN users.is_verified IS 'Email đã được xác thực chưa (Google tự động verify)';
COMMENT ON COLUMN users.is_active IS 'Tài khoản có đang hoạt động không';
COMMENT ON COLUMN users.status IS 'Trạng thái phê duyệt tài khoản';
COMMENT ON COLUMN users.assigned_station_id IS 'ID trạm được phân công (chỉ cho STAFF)';


-- ==== 2. Bảng VEHICLES ====
-- Lưu trữ thông tin phương tiện của Driver
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,

    -- Vehicle Info
    vin VARCHAR(17) NOT NULL UNIQUE,
    model VARCHAR(50) NOT NULL,
    license_plate VARCHAR(15) NOT NULL UNIQUE,

    -- Battery Info
    battery_type VARCHAR(50) NOT NULL,
    battery_capacity DOUBLE PRECISION NOT NULL,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_vehicle_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT chk_vehicle_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vehicle_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_vehicle_license_plate ON vehicles(license_plate);

COMMENT ON TABLE vehicles IS 'Bảng lưu trữ phương tiện của Driver';


-- ==== 3. Bảng OTP_TOKENS ====
-- Lưu trữ mã OTP để xác thực email
CREATE TABLE IF NOT EXISTS otp_tokens (
    id BIGSERIAL PRIMARY KEY,

    -- OTP Info
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    otp_type VARCHAR(20) NOT NULL,

    -- Expiry & Usage
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_otp_type CHECK (otp_type IN ('REGISTRATION', 'PASSWORD_RESET'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_tokens(email);
CREATE INDEX IF NOT EXISTS idx_otp_code ON otp_tokens(otp_code);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_tokens(expires_at);

COMMENT ON TABLE otp_tokens IS 'Bảng lưu trữ mã OTP (hiệu lực 5 phút)';


-- ==== 4. Bảng REFRESH_TOKENS ====
-- Lưu trữ Refresh Token của người dùng
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,

    -- Token Info
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_refresh_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_expires_at ON refresh_tokens(expires_at);

COMMENT ON TABLE refresh_tokens IS 'Bảng lưu trữ Refresh Token (hiệu lực 7 ngày)';


-- ==== TRIGGER: Auto update updated_at ====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger cho các bảng cần auto-update
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

