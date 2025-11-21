import axiosInstance from "./axiosInstance";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

/**
 * Hàm xử lý lỗi chung
 */
const handleError = (error) => {
    // Error structure từ axiosInstance:
    // { statusCode, message, data, originalError }
    const statusCode = error?.statusCode;
    const message = error?.data || error?.message || "Đã xảy ra lỗi không xác định";

    // Không hiển thị toast cho một số trường hợp đặc biệt
    const skipToastCodes = [404, 409, 500]; // Để component tự xử lý

    if (skipToastCodes.includes(statusCode)) {
        throw error;
    }

    // Xử lý 401 - Token hết hạn
    if (statusCode === 401) {
        const { logout } = useAuthStore.getState();
        logout();
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
        throw error;
    }

    // Hiển thị message từ backend (ưu tiên data, sau đó message)
    toast.error(message);

    throw error;
};

/**
 * API client chuẩn hóa cho toàn ứng dụng
 */
export const apiClient = {
    /**
     * GET: Lấy dữ liệu
     * @param {string} url - Endpoint (vd: "/books")
     * @param {object} config - Optional Axios config
     */
    async get(url, config = {}) {
        try {
            const response = await axiosInstance.get(url, config);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * POST: Tạo dữ liệu mới
     * @param {string} url
     * @param {object|FormData} data
     * @param {object} config
     */
    async post(url, data, config = {}) {
        try {
            const headers = {};
            if (data instanceof FormData) {
                headers["Content-Type"] = "multipart/form-data";
            }

            const response = await axiosInstance.post(url, data, {
                ...config,
                headers: { ...headers, ...config.headers },
            });
            return response;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * PUT: Cập nhật toàn bộ dữ liệu
     */
    async put(url, data, config = {}) {
        try {
            const response = await axiosInstance.put(url, data, config);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * PATCH: Cập nhật một phần dữ liệu
     */
    async patch(url, data, config = {}) {
        try {
            const response = await axiosInstance.patch(url, data, config);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * DELETE: Xóa dữ liệu
     */
    async delete(url, config = {}) {
        try {
            const response = await axiosInstance.delete(url, config);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },
};