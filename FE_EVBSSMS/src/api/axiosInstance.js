import axios from "axios";
import { toast } from "react-toastify";

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

        if (!response) {
            toast.error("Không thể kết nối tới máy chủ!");
            return Promise.reject(error);
        }

        switch (response.status) {
            case 401:
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("userId");
                window.location.href = "/";
                toast.error("Phiên đăng nhập hết hạn!");
                break;
            case 403:
                toast.error("Bạn không có quyền truy cập!");
                break;
            case 404:
                toast.error("Không tìm thấy dữ liệu!");
                break;
            case 500:
                toast.error("Lỗi hệ thống!");
                break;
            default:
                toast.error(response.data?.message || "Đã xảy ra lỗi!");
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;