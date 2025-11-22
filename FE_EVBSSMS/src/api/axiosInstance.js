import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const { response } = error;

        // Nếu không có response (network error)
        if (!response) {
            return Promise.reject({
                statusCode: 0,
                message: "Không thể kết nối tới máy chủ!",
                data: null,
            });
        }

        // Trả về error với cấu trúc chuẩn từ backend
        return Promise.reject({
            statusCode: response.data?.statusCode || response.status,
            message: response.data?.message || "Đã xảy ra lỗi!",
            data: response.data?.data || null,
            originalError: error,
        });
    }
);

export default axiosInstance;