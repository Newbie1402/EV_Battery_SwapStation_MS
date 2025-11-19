-- Migration: Tạo bảng verification_tokens để lưu token xác nhận đăng ký
-- Token có hiệu lực 48 giờ thay vì OTP 5 phút

CREATE TABLE IF NOT EXISTS verification_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(100) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,

    CONSTRAINT fk_verification_token_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
);

-- Tạo index để tối ưu truy vấn
CREATE INDEX idx_verification_token ON verification_tokens(token);
CREATE INDEX idx_verification_user_id ON verification_tokens(user_id);
CREATE INDEX idx_verification_expires_at ON verification_tokens(expires_at);

-- Comment mô tả bảng
COMMENT ON TABLE verification_tokens IS 'Bảng lưu trữ token xác nhận đăng ký, có hiệu lực 48 giờ';
COMMENT ON COLUMN verification_tokens.token IS 'UUID token để xác nhận đăng ký';
COMMENT ON COLUMN verification_tokens.user_id IS 'ID người dùng liên kết với token';
COMMENT ON COLUMN verification_tokens.expires_at IS 'Thời gian hết hạn (48 giờ kể từ lúc tạo)';
COMMENT ON COLUMN verification_tokens.is_used IS 'Token đã được sử dụng chưa';
COMMENT ON COLUMN verification_tokens.verified_at IS 'Thời gian user xác nhận token';

