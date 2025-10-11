-- Migration V2: Cập nhật constraint chk_status để hỗ trợ PENDING_VERIFICATION và BANNED
-- Author: System
-- Date: 2025-10-11
-- Description: Thêm PENDING_VERIFICATION và BANNED vào constraint chk_status để khớp với enum UserStatus

-- Bước 1: Xóa constraint cũ
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_status;

-- Bước 2: Thêm constraint mới với đầy đủ các giá trị
ALTER TABLE users ADD CONSTRAINT chk_status
    CHECK (status IN ('PENDING_APPROVAL', 'REJECTED', 'PENDING_VERIFICATION', 'ACTIVE', 'INACTIVE', 'BANNED'));

-- Comment
COMMENT ON CONSTRAINT chk_status ON users IS 'Kiểm tra trạng thái tài khoản hợp lệ';

