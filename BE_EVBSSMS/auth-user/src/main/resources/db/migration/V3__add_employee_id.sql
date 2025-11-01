-- Migration V3: Thêm cột employee_id cho bảng users
-- Author: Copilot
-- Date: 2025-11-02
-- Description: Thêm trường employee_id để lưu mã nhân viên (EVD/EVS + 6 chữ số). Tạo index và ràng buộc unique.

-- Thêm cột nếu chưa tồn tại (Postgres hỗ trợ IF NOT EXISTS)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS employee_id VARCHAR(20);

-- Tạo unique index cho employee_id (nếu chưa tồn tại)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'i' AND c.relname = 'idx_employee_id'
    ) THEN
        CREATE UNIQUE INDEX idx_employee_id ON users(employee_id);
    END IF;
END$$;


