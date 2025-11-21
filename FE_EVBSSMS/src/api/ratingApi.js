import {apiClient} from "@/api/apiClient.js";

/**
 * Rating API
 * Base URL: /api/ratings
 */

const BASE_URL = "booking/api/ratings";

/**
 * 1. Tạo đánh giá mới
 * POST /api/ratings
 * @param {Object} ratingData - { bookingId, score, comment, driverId (= employeeId tu authStore), stationId }
 * @returns {Promise<Object>} Rating object
 */
export const createRating = async (ratingData) => {
    const res = await apiClient.post(`${BASE_URL}`, ratingData);
    return res?.data || res;
}

/**
 * 2. Lấy đánh giá theo booking ID
 * GET /api/ratings/booking/{bookingId}
 * @param {number} bookingId - Booking ID
 * @returns {Promise<Object>} Rating object
 */
export const getRatingByBookingId = async (bookingId) => {
    const res = await apiClient.get(`${BASE_URL}/booking/${bookingId}`);
    return res?.data || res;
};

/**
 * 3. Lấy đánh giá theo driver ID
 * GET /api/ratings/driver/{driverId}?page={page}&size={size}
 * @param {string} driverId - Driver ID
 * @param {number} page - Số trang (default: 0)
 * @param {number} size - Kích thước trang (default: 10)
 * @returns {Promise<Object>} Page<Rating> - { content[], totalElements, totalPages }
 */
export const getRatingsByDriverId = async (driverId, page = 0, size = 10) => {
    const res = await apiClient.get(`${BASE_URL}/driver/${driverId}`, {
        params: { page, size },
    });
    return res?.data || res;
};

/**
 * 4. Lấy đánh giá theo station ID
 * GET /api/ratings/station/{stationId}?page={page}&size={size}
 * @param {string} stationId - Station ID
 * @param {number} page - Số trang (default: 0)
 * @param {number} size - Kích thước trang (default: 10)
 * @returns {Promise<Object>} Page<Rating> - { content[], totalElements, totalPages }
 */
export const getRatingsByStationId = async (stationId, page = 0, size = 10) => {
    const res = await apiClient.get(`${BASE_URL}/station/${stationId}`, {
        params: { page, size },
    });
    return res?.data || res;
};

/** 5. Cập nhật đánh giá theo ID
 * PUT /api/ratings/{id}
 * @param {number} id - Rating ID
 * @param {Object} ratingData - { score, comment }
 * @returns {Promise<Object>} Updated Rating object
 */
export const updateRatingById = async (id, ratingData) => {
    const res = await apiClient.patch(`${BASE_URL}/${id}`, ratingData);
    return res?.data || res;
};

/**
 * 6. Lấy thống kê đánh giá của station
 * GET /api/ratings/station/{stationId}/stats
 * @param {string} stationId - Station ID
 * response example:{
      "stationId": "string",
      "totalRatings": 0,
      "averageScore": 0.1,
      "fiveStarCount": 0,
      "fourStarCount": 0,
      "threeStarCount": 0,
      "twoStarCount": 0,
      "oneStarCount": 0
    }
 */
export const getStatsRatingByStationId = async (stationId) => {
    const res = await apiClient.get(`${BASE_URL}/station/${stationId}/stats`);
    return res?.data || res;
};

/**
 * 7. Xóa đánh giá theo ID
 * DELETE /api/ratings/{id}
 * @param {number} id - Rating ID
 * @returns {Promise<void>}
 **/
export const deleteRatingById = async (id) => {
    return await apiClient.delete(`${BASE_URL}/${id}`);
};

export const ratingApi = {
    createRating,
    getRatingByBookingId,
    getRatingsByDriverId,
    getRatingsByStationId,
    getStatsRatingByStationId,
    updateRatingById,
    deleteRatingById,
};