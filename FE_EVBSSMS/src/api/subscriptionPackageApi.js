import { apiClient } from "@/api/apiClient.js";

/**
 * Subscription Package API
 * Base URL: /api/subscriptions
 */

const BASE_URL = "booking/api/subscriptions";

/**
 * 1. Tạo đăng ký mới
 * POST /api/subscriptions
 * @param {Object} subscriptionData - { userId, packagePlanId, autoExtend? }
 * @returns {Promise<Object>} UserPackageSubscriptionResponse
 */
export const createSubscription = async (subscriptionData) => {
    const res = await apiClient.post(BASE_URL, subscriptionData, {
        successMessage: "Đăng ký gói thành công!",
    });
    return res?.data || res;
};

/**
 * 2. Lấy đăng ký theo ID
 * GET /api/subscriptions/{id}
 * @param {number} id - ID đăng ký
 * @returns {Promise<Object>} UserPackageSubscriptionResponse
 */
export const getSubscriptionById = async (id) => {
    const res = await apiClient.get(`${BASE_URL}/${id}`);
    return res?.data || res;
};

/**
 * 3. Lấy đăng ký ACTIVE của user
 * GET /api/subscriptions/user/{userId}/active
 * @param {string} userId
 * @returns {Promise<Object>} UserPackageSubscriptionResponse
 */
export const getActiveSubscriptionByUserId = async (userId) => {
    const res = await apiClient.get(`${BASE_URL}/user/${userId}/active`);
    return res?.data || res;
};

/**
 * 4. Lịch sử đăng ký của user (phân trang)
 * GET /api/subscriptions/user/{userId}/history?page={page}&size={size}
 * @param {string} userId
 * @param {number} page - Trang (0-based)
 * @param {number} size - Kích thước
 * @returns {Promise<Object>} Page<UserPackageSubscriptionResponse> - { content[], totalElements, totalPages }
 */
export const getSubscriptionHistory = async (userId, page = 0, size = 10) => {
    const res = await apiClient.get(`${BASE_URL}/user/${userId}/history`, {
        params: { page, size },
    });
    return res?.data || res;
};

/**
 * 5. Thống kê gói hiện tại của user
 * GET /api/subscriptions/user/{userId}/stats
 * @param {string} userId
 * @returns {Promise<Object>} Stats object với thông tin chi tiết gói
 */
export const getSubscriptionStats = async (userId) => {
    const res = await apiClient.get(`${BASE_URL}/user/${userId}/stats`);
    return res?.data || res;
};

/**
 * 6. Tăng số lần sử dụng (swap)
 * POST /api/subscriptions/{id}/increment-swaps
 * @param {number} id - ID đăng ký
 * @returns {Promise<string>} Thông báo thành công
 */
export const incrementSwaps = async (id) => {
    const res = await apiClient.post(`${BASE_URL}/${id}/increment-swaps`, null, {
        successMessage: "Đã ghi nhận lượt swap!",
    });
    return res?.data || res;
};

/**
 * 7. Hủy đăng ký (ACTIVE -> INACTIVE)
 * POST /api/subscriptions/{id}/cancel
 * @param {number} id
 * @returns {Promise<Object>} UserPackageSubscriptionResponse với status INACTIVE
 */
export const cancelSubscription = async (id) => {
    const res = await apiClient.post(`${BASE_URL}/${id}/cancel`, null, {
        successMessage: "Đã hủy đăng ký!",
    });
    return res?.data || res;
};

/**
 * 8. Danh sách sắp hết hạn (7 ngày tới)
 * GET /api/subscriptions/expiring-soon
 * @returns {Promise<Array>} Danh sách UserPackageSubscriptionResponse[]
 */
export const getExpiringSoonSubscriptions = async () => {
    const res = await apiClient.get(`${BASE_URL}/expiring-soon`);
    return res?.data || res || [];
};

/**
 * 9. Cập nhật hàng loạt trạng thái EXPIRED (admin)
 * POST /api/subscriptions/update-expired
 * @returns {Promise<string>} Thông báo thành công
 */
export const updateExpiredSubscriptions = async () => {
    const res = await apiClient.post(`${BASE_URL}/update-expired`, null, {
        successMessage: "Đã cập nhật các đăng ký hết hạn!",
    });
    return res?.data || res;
};

/**
 * 10. Cập nhật trạng thái thủ công
 * PATCH /api/subscriptions/{id}/status?status={status}
 * @param {number} id
 * @param {string} status - ACTIVE | INACTIVE | EXPIRED
 * @returns {Promise<Object>} UserPackageSubscriptionResponse
 */
export const updateSubscriptionStatus = async (id, status) => {
    const res = await apiClient.patch(`${BASE_URL}/${id}/status`, null, {
        params: { status },
        successMessage: "Cập nhật trạng thái thành công!",
    });
    return res?.data || res;
};

/**
 * 11. Bật/tắt tự động gia hạn
 * PATCH /api/subscriptions/{id}/auto-extend?autoExtend={autoExtend}
 * @param {number} id
 * @param {boolean} autoExtend
 * @returns {Promise<Object>} UserPackageSubscriptionResponse với autoExtend đã cập nhật
 */
export const toggleAutoExtend = async (id, autoExtend) => {
    const res = await apiClient.patch(`${BASE_URL}/${id}/auto-extend`, null, {
        params: { autoExtend },
        successMessage: `Đã ${autoExtend ? "bật" : "tắt"} tự động gia hạn!`,
    });
    return res?.data || res;
};

/**
 * 12. Gia hạn endDate theo loại gói
 * PATCH /api/subscriptions/{id}/extend?periods={periods}
 * @param {number} id - ID đăng ký
 * @param {number} periods - Số chu kỳ gia hạn (>=1). Mặc định 1
 * @returns {Promise<Object>} UserPackageSubscriptionResponse với endDate mới, usedSwaps = 0
 */
export const extendSubscription = async (id, periods = 1) => {
    const res = await apiClient.patch(`${BASE_URL}/${id}/extend`, null, {
        params: { periods },
        successMessage: "Gia hạn gói thành công!",
    });
    return res?.data || res;
};

/**
 * 13. Lấy danh các subscription cua theo PackagePlanID
 * GET /api/subscriptions/package-plan/{packagePlanId}
 * @param {number} packagePlanId - ID gói
 * @returns {Promise<Array>} Danh sách UserPackageSubscriptionResponse[]
 */
export const getSubscriptionsByPackagePlanId = async (packagePlanId) => {
    const res = await apiClient.get(`${BASE_URL}/package-plan/${packagePlanId}`);
    return res?.data || res || [];
}

// Backward compatibility exports
export const subscriptionUserPackage = createSubscription;
export const getSubscriptionByUserId = getSubscriptionStats;
export const getSubscriptionHistoryByUserId = getSubscriptionHistory;
export const cancelSubscriptionById = cancelSubscription;
export const incrementUserSwapsById = incrementSwaps;
export const renewExpiredSubscriptions = updateExpiredSubscriptions;

export const subscriptionPackageApi = {
    createSubscription,
    getSubscriptionById,
    getActiveSubscriptionByUserId,
    getSubscriptionHistory,
    getSubscriptionStats,
    incrementSwaps,
    cancelSubscription,
    getExpiringSoonSubscriptions,
    updateExpiredSubscriptions,
    updateSubscriptionStatus,
    toggleAutoExtend,
    extendSubscription,
    getSubscriptionsByPackagePlanId,
    // Backward compatibility
    subscriptionUserPackage,
    getSubscriptionByUserId,
    getSubscriptionHistoryByUserId,
    cancelSubscriptionById,
    incrementUserSwapsById,
    renewExpiredSubscriptions,
};
