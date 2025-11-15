-- Migration V6: Tạo bảng support_tickets và support_ticket_attachments
-- Author: System
-- Date: 2025-11-15
-- Description: Tạo bảng lưu trữ support tickets và file đính kèm cho hệ thống

-- ==== 1. Bảng SUPPORT_TICKETS ====
-- Lưu trữ thông tin support tickets của người dùng
CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    vehicle_id BIGINT,
    location VARCHAR(500),
    ticket_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    incident_time TIMESTAMP WITHOUT TIME ZONE,
    resolved_at TIMESTAMP WITHOUT TIME ZONE,
    resolved_by VARCHAR(100),
    resolution_notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE,

    -- Foreign Keys
    CONSTRAINT fk_support_tickets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_support_tickets_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,

    -- Constraints
    CONSTRAINT chk_ticket_type CHECK (ticket_type IN ('BATTERY_ISSUE', 'VEHICLE_MALFUNCTION', 'STATION_EQUIPMENT', 'SWAP_FAILURE', 'PAYMENT_ISSUE', 'SERVICE_QUALITY', 'OTHER')),
    CONSTRAINT chk_priority CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    CONSTRAINT chk_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'))
);

-- ==== 2. Bảng SUPPORT_TICKET_ATTACHMENTS ====
-- Lưu trữ URL file đính kèm của support tickets
CREATE TABLE IF NOT EXISTS support_ticket_attachments (
    ticket_id BIGINT NOT NULL,
    attachment_url VARCHAR(500) NOT NULL,

    -- Foreign Key
    CONSTRAINT fk_attachments_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

-- ==== 3. Tạo Indexes ====
CREATE INDEX idx_support_tickets_ticket_id ON support_tickets(ticket_id);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_vehicle_id ON support_tickets(vehicle_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_ticket_type ON support_tickets(ticket_type);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at);

-- ==== 4. Thêm Comments ====
COMMENT ON TABLE support_tickets IS 'Bảng lưu trữ support tickets của người dùng khi gặp sự cố';
COMMENT ON TABLE support_ticket_attachments IS 'Bảng lưu trữ URL file đính kèm của support tickets';
COMMENT ON COLUMN support_tickets.ticket_id IS 'Mã ticket duy nhất';
COMMENT ON COLUMN support_tickets.user_id IS 'ID người dùng tạo ticket';
COMMENT ON COLUMN support_tickets.vehicle_id IS 'ID phương tiện gặp sự cố (nếu có)';
COMMENT ON COLUMN support_tickets.ticket_type IS 'Loại sự cố: BATTERY_ISSUE, VEHICLE_MALFUNCTION, etc.';
COMMENT ON COLUMN support_tickets.priority IS 'Mức độ ưu tiên: CRITICAL, HIGH, MEDIUM, LOW';
COMMENT ON COLUMN support_tickets.status IS 'Trạng thái: OPEN, IN_PROGRESS, RESOLVED, CLOSED';
COMMENT ON COLUMN support_tickets.incident_time IS 'Thời gian xảy ra sự cố';
COMMENT ON COLUMN support_tickets.resolved_at IS 'Thời gian giải quyết xong';
COMMENT ON COLUMN support_tickets.resolved_by IS 'Người giải quyết (employee_id hoặc email)';

