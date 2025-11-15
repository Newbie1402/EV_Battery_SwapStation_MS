-- Thêm cột image_url vào bảng vehicles để lưu URL ảnh từ AWS S3

ALTER TABLE vehicles
ADD COLUMN image_url VARCHAR(500);

COMMENT ON COLUMN vehicles.image_url IS 'URL ảnh xe lưu trên AWS S3';

