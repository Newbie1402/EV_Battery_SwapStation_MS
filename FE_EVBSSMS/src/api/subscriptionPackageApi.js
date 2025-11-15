import { apiClient } from "@/api/apiClient.js";

/**
 * Subscription Package API
 * Base URL: /api/subscriptions
 */

const BASE_URL = "/subscriptions";

/** Lấy tất cả subscription packages
 * GET /api/subscriptions/packages
 * @returns {Promise<Array>} Danh sách tất cả subscription packages
 */
export const getAllSubscriptionPackages = async () => {
    const res = await apiClient.get(`${BASE_URL}/packages`);
    return res?.data || [] || res;
}

/**
 * Lấy chi tiết subscription theo ID
 * GET /api/subscriptions/{id}
 * @param {number} id - Subscription ID
 * @returns {Promise<Object>} Subscription Package object
 */
export const getSubscriptionById = async (id) => {
    const res = await apiClient.get(`${BASE_URL}/${id}`);
    return res || null;
};

/**
 * Tạo subscription package mới
 * POST /api/subscriptions
 * request body: {
 *userId, packagePlanId}
 */
export const subscriptionUserPackage = async (data) => {
    const res = await apiClient.post(`${BASE_URL}`, data);
    return res?.data?.data || res || null;
}

export const subscriptionPackageApi = {
    getAllSubscriptionPackages,
    getSubscriptionById,
    subscriptionUserPackage,
}