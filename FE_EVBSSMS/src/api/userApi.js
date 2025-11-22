import { apiClient } from "./apiClient";

// ==================== BASE URLs ====================
const BASE_URL = "/auth-user/api/users";

// ==================== USER MANAGEMENT ====================

/**
 * Lấy thông tin profile của người dùng hiện tại
 * @returns {Promise<Object>}
 */
export const getProfileUser = async () => {
    const response = await apiClient.get(`${BASE_URL}/profile`);
    return response;
};

/**
 * Cập nhật thông tin profile của người dùng hiện tại
 * @param {object} data - {phone, fullName, birthday, address, identityCard}
 * @returns {Promise<Object>}
 */
export const updateProfileUser = async (data) => {
    const response = await apiClient.put(`${BASE_URL}/profile`, data);
    return response;
};

export const userApi = {
    getProfileUser,
    updateProfileUser,
};