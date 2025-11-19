import { apiClient } from "./apiClient";

// ==================== BASE URLs ====================
const BASE_URL = "/auth-user/api/auth";
const BASE_URL_OAUTH2_GOOGLE = `${BASE_URL}/oauth2/google`;
const BASE_URL_VERIFICATION = "/auth-user/api/verification";

// ==================== AUTHENTICATION ====================

export const verifyOtp = async (email, otpCode) => apiClient.post(`${BASE_URL}/verify-otp`, { email, otpCode });
export const resendOtp = async (email) => apiClient.post(`${BASE_URL}/resend-otp`, { email });
export const refreshToken = async (refreshToken) => apiClient.post(`${BASE_URL}/refresh-token`, { refreshToken });
export const registerWithGoogle = async (data) => apiClient.post(`${BASE_URL_OAUTH2_GOOGLE}/register`, data);
export const loginWithGoogle = async (idToken) => apiClient.post(`${BASE_URL_OAUTH2_GOOGLE}/login`, { idToken });
export const logout = async (refreshToken) => apiClient.post(`${BASE_URL}/logout`, { refreshToken });
export const confirmRegistration = async (token) => apiClient.get(`${BASE_URL_VERIFICATION}/confirm`, { params: { token } });

export const authApi = {
    verifyOtp,
    resendOtp,
    refreshToken,
    registerWithGoogle,
    loginWithGoogle,
    logout,
    confirmRegistration,
};
