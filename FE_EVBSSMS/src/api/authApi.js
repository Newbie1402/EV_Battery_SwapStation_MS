import { apiClient } from "./apiClient";

// ==================== BASE URLs ====================
const BASE_URL = "/auth-user/api/auth";
const BASE_URL_OAUTH2_GOOGLE = `${BASE_URL}/oauth2/google`;

// ==================== AUTHENTICATION ====================

/**
 * Xác thực OTP
 * @param {string} email
 * @param {string} otpCode - Mã OTP 6 chữ số
 * @returns {Promise<Object>}
 */
export const verifyOtp = async (email, otpCode) => {
    const response = await apiClient.post(`${BASE_URL}/verify-otp`, {
        email,
        otpCode,
    });
    return response;
};

/**
 * Gửi lại OTP
 * @param {string} email
 * @returns {Promise<Object>}
 */
export const resendOtp = async (email) => {
    const response = await apiClient.post(`${BASE_URL}/resend-otp`, { email });
    return response;
};

/**
 * Làm mới Access Token
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
export const refreshToken = async (refreshToken) => {
    const response = await apiClient.post(`${BASE_URL}/refresh-token`, {
        refreshToken,
    });
    return response;
};

/**
 * Đăng ký bằng Google OAuth2
 * @param {object} data - {idToken, phone, birthday, role, address, identityCard, vehicles}
 * @returns {Promise<Object>}
 */
export const registerWithGoogle = async (data) => {
    const response = await apiClient.post(`${BASE_URL_OAUTH2_GOOGLE}/register`, data);
    return response;
};

/**
 * Đăng nhập bằng Google OAuth2
 * @param {string} idToken
 * @returns {Promise<Object>}
 */
export const loginWithGoogle = async (idToken) => {
    const response = await apiClient.post(`${BASE_URL_OAUTH2_GOOGLE}/login`, {
        idToken,
    });
    return response;
};

/**
 * Đăng xuất
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
export const logout = async (refreshToken) => {
    const response = await apiClient.post(`${BASE_URL}/logout`, { refreshToken });
    return response;
};

export const authApi = {
    verifyOtp,
    resendOtp,
    refreshToken,
    registerWithGoogle,
    loginWithGoogle,
    logout,
};
