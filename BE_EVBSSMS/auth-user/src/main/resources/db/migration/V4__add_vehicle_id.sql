-- Thêm cột vehicle_id vào bảng vehicles
-- vehicle_id là mã xe công khai theo format: EV + 2 số cuối biển số + ddMMYY + model
-- Ví dụ: EV45141124VFe34

ALTER TABLE vehicles
ADD COLUMN vehicle_id VARCHAR(50) UNIQUE;

-- Tạo index cho vehicle_id để tăng tốc độ truy vấn
CREATE INDEX idx_vehicle_id ON vehicles(vehicle_id);

-- Cho phép user_id có thể null (phương tiện chưa được cấp phát)
ALTER TABLE vehicles
ALTER COLUMN user_id DROP NOT NULL;

-- Comment giải thích
COMMENT ON COLUMN vehicles.vehicle_id IS 'Mã xe công khai: EV + 2 số cuối biển số + ddMMYY + model';
COMMENT ON COLUMN vehicles.user_id IS 'ID người dùng được cấp phát phương tiện (nullable nếu chưa cấp phát)';

