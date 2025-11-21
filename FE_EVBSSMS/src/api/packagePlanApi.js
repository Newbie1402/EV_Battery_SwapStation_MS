import { apiClient } from "./apiClient";

/**
 * Package Plan API
 * Base URL: /api/package-plans
 */

const BASE_URL = "/booking/api/package-plans";

/**
 * 1. Lấy tất cả package plans
 * GET /api/package-plans
 * @returns {Promise<Array>} Danh sách tất cả package plans
 */
export const getAllPackagePlans = async (page = 0, size = 10) => {
    const res = await apiClient.get(`${BASE_URL}?page=${page}&size=${size}`);
    return res?.content || [] || res.data.content;
};

/**
 * 2. Lấy package plan theo ID
 * GET /api/package-plans/{id}
 * @param {number} id - Package Plan ID
 * @returns {Promise<Object>} Package plan object
 */
export const getPackagePlanById = async (id) => {
    return await apiClient.get(`${BASE_URL}/${id}`);
};

/**
 * 3. Tạo package plan mới (Admin only)
 * POST /api/package-plans
 * @param {Object} data - Package plan data
 * @param {string} data.name - Tên gói (required)
 * @param {string} data.description - Mô tả gói
 * @param {number} data.price - Giá gói (required)
 * @param {number} data.maxSwapPerMonth - Số lần đổi pin tối đa moi thang (required)
 * @param {string} data.packageType - Loai: MONTHLY, YEARLY (required)
 * @returns {Promise<Object>} Package plan đã tạo
 */
export const createPackagePlan = async (data) => {
    return await apiClient.post(`${BASE_URL}`, data);
};

/**
 * 4. Cập nhật package plan (Admin only)
 * PATCH /api/package-plans/{id}
 * @param {number} id - Package Plan ID
 * @param {Object} data - Package plan data cần cập nhật
 * @param {string} data.packageName - Tên gói
 * @param {string} data.description - Mô tả gói
 * @param {number} data.price - Giá gói
 * @param {number} data.durationDays - Số ngày sử dụng
 * @param {number} data.swapLimit - Số lần đổi pin tối đa
 * @param {string} data.status - Trạng thái: ACTIVE, INACTIVE
 * @returns {Promise<Object>} Package plan đã cập nhật
 */
export const updatePackagePlan = async (id, data) => {
    return await apiClient.patch(`${BASE_URL}/${id}`, data);
};

/**
 * 5. Xóa package plan (Admin only)
 * DELETE /api/package-plans/{id}
 * Lưu ý: Đây là soft delete, status sẽ chuyển sang INACTIVE thay vì xóa cứng
 * @param {number} id - Package Plan ID
 * @returns {Promise<Object>} Response message
 */
export const deletePackagePlan = async (id) => {
    return await apiClient.delete(`${BASE_URL}/${id}`);
};

/**
 * 6. Kích hoạt package plan (Admin only)
 * PATCH /api/package-plans/{id}/activate
 * Chuyển status từ INACTIVE sang ACTIVE
 * @param {number} id - Package Plan ID
 * @returns {Promise<Object>} Response message
 */
export const activePackagePlan = async (id) => {
    return await apiClient.put(`${BASE_URL}/${id}/activate`);
};

/** Package Plan Status Enum */
export const PACKAGE_PLAN_STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
};

export const PACKAGE_PLAN_TYPE = {
    MONTHLY: "MONTHLY",
    YEARLY: "YEARLY",
};

/**
 * Package Plan API object
 */
export const packagePlanApi = {
    getAllPackagePlans,
    getPackagePlanById,
    createPackagePlan,
    updatePackagePlan,
    deletePackagePlan,
    activePackagePlan,
    PACKAGE_PLAN_STATUS,
    PACKAGE_PLAN_TYPE,
};
