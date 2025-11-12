import axiosInstance from "./axiosInstance";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

/**
 * Hàm xử lý lỗi chung
 */
const handleError = (error) => {
    const status = error?.response?.status;
    const message =
        error?.response?.data?.error ||
        error?.message ||
        "Đã xảy ra lỗi không xác định";

    if(message === "Giỏ hàng trống") {
        throw error;
    }
    if (status === 401) {
        const { logout } = useAuthStore.getState();
        logout();
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
    } else {
        toast.error(message);
    }

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