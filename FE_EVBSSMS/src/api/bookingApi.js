import { apiClient } from "./apiClient";

/**
 * Booking API
 * Base URL: /api/bookings
 */

const BASE_URL = "booking/api/bookings";

/**
 * 1. Lấy tất cả bookings với phân trang
 * @param {number} page - Số trang (default: 0)
 * @param {number} size - Kích thước trang (default: 10)
 * @returns {Promise<Object>}
 */
export const getAllBookings = async (page = 0, size = 10) => {
    return await apiClient.get(`${BASE_URL}/getall?page=${page}&size=${size}`);
};

/**
 * 2. Lấy chi tiết booking theo ID
 * @param {number} id - Booking ID
 * @returns {Promise<Object>}
 */
export const getBookingById = async (id) => {
    return await apiClient.get(`${BASE_URL}/${id}`);
};

/**
 * 3. Lấy bookings theo driver ID
 * @param {string} driverId - Driver ID
 * @param {number} page - Số trang (default: 0)
 * @param {number} size - Kích thước trang (default: 10)
 * @returns {Promise<Object>}
 */
export const getBookingsByDriver = async (driverId, page = 0, size = 10) => {
    return await apiClient.get(`${BASE_URL}/driver/${driverId}?page=${page}&size=${size}`);
};

/**
 * 4. Lấy bookings theo station ID
 * @param {string} stationId - Station ID
 * @param {number} page - Số trang (default: 0)
 * @param {number} size - Kích thước trang (default: 10)
 * @returns {Promise<Object>}
 */
export const getBookingsByStation = async (stationId, page = 0, size = 10) => {
    return await apiClient.get(`${BASE_URL}/station/${stationId}?page=${page}&size=${size}`);
};

/**
 * 7. Tìm kiếm bookings theo nhiều tiêu chí
 * @param {Object} params - Query parameters
 * @param {string} params.driverId - Driver ID
 * @param {string} params.stationId - Station ID
 * @param {string} params.bookingStatus - Booking status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
 * @param {number} params.page - Số trang (default: 0)
 * @param {number} params.size - Kích thước trang (default: 10)
 * @returns {Promise<Object>}
 */
export const searchBookings = async (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, params[key]);
        }
    });

    return await apiClient.get(`${BASE_URL}/search?${queryParams.toString()}`);
};

/**
 * 8. Lấy thống kê bookings theo ngày
 * @param {string} date - Ngày cần thống kê (YYYY-MM-DD)
 * @returns {Promise<Object>}
 */
export const getBookingStatistics = async (date) => {
    return await apiClient.get(`${BASE_URL}/statistics?date=${date}`);
};

/**
 * 9. Tạo booking mới
 * @param {Object} data - Booking data
 * @param {string} data.driverId - Driver ID
 * @param {string} data.stationId - Station ID
 * @param {string} data.batteryModelId - Battery Model ID
 * @param {string} data.scheduledTime - Scheduled time (ISO 8601)
 * @param {string} data.paymentType - Payment type (PER_SWAP, MONTHLY_PACKAGE)
 * @param {string} data.notes - Notes (optional)
 * @param {string} data.packageId - Package ID (optional)
 * @returns {Promise<Object>}
 */
export const createBooking = async (data) => {
    return await apiClient.post(`${BASE_URL}/create`, data);
};

/**
 * 10. Xác nhận booking
 * @param {number} id - Booking ID
 * @returns {Promise<Object>}
 */
export const confirmBooking = async (id) => {
    return await apiClient.post(`${BASE_URL}/${id}/confirm`, {});
};

/**
 * 11. Hoàn thành booking
 * @param {number} id - Booking ID
 * @param {number} paymentId - Payment ID
 * @returns {Promise<Object>}
 */
export const completeBooking = async (id, paymentId) => {
    return await apiClient.post(`${BASE_URL}/${id}/complete`, {paymentId});
};

/**
 * 12. Hủy booking
 * @param {number} id - Booking ID
 * @param {Object} data - Cancel data
 * @param {string} data.cancelReason - Lý do hủy
 * @param {string} data.cancelledBy - Người hủy
 * @returns {Promise<Object>}
 */
export const cancelBooking = async (id, data) => {
    return await apiClient.post(`${BASE_URL}/${id}/cancel`, data);
};

/**
 * 13. Cập nhật thông tin booking
 * @param {number} id - Booking ID
 * @param {Object} data - Dữ liệu cập nhật (notes, scheduledTime, etc.)
 * @returns {Promise<Object>}
 */
export const updateBooking = async (id, data) => {
    return await apiClient.patch(`${BASE_URL}/${id}`, data);
};

/**
 * 14. Xóa booking
 * @param {number} id - Booking ID
 * @returns {Promise<Object>}
 */
export const deleteBooking = async (id) => {
    return await apiClient.delete(`${BASE_URL}/${id}`);
};

/**
 * Xac nhan isPaid cho booking
 * @param {number} id - Booking ID
 * @returns {Promise<Object>}
 */
export const confirmBookingPayment = async (id) => {
    return await apiClient.put(`${BASE_URL}/confirmedIsPaid/${id}`, {});
}

// Export all booking API
export const bookingApi = {
    getAllBookings,
    getBookingById,
    getBookingsByDriver,
    getBookingsByStation,
    searchBookings,
    getBookingStatistics,
    createBooking,
    confirmBooking,
    completeBooking,
    cancelBooking,
    updateBooking,
    deleteBooking,
    confirmBookingPayment,
};

