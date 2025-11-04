import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

/**
 * Custom mutation hook cho REST API (POST / PUT / PATCH / DELETE)
 * Tự động: toast success/error, refetch queryKey liên quan, logout khi 401
 *
 * @param {string} apiFnOrUrl - service API function (ví dụ: sellerApi.createSeller)
 * @param {"POST"|"PUT"|"PATCH"|"DELETE"} method - HTTP method
 * @param {object} options - Cấu hình mở rộng (onSuccess, onError, invalidateKeys, ...)
 */

//Dùng cho các thao tác thay đổi dữ liệu (POST, PUT, DELETE)
export default function useCustomMutation(apiFnOrUrl, method, options = {}) {
    const queryClient = useQueryClient();
    const { logout } = useAuthStore();

    const mutationFn = async (data) => {
        try {
            const response =
                typeof apiFnOrUrl === "string"
                    ? await axiosInstance({ url: apiFnOrUrl, method, data })
                    : await apiFnOrUrl(data); // nếu truyền function

            // Return the response directly (apiClient already returns response.data)
            return response;
        } catch (err) {
            const status = err?.response?.status;
            const message = err?.response?.data?.message || "Lỗi không xác định";
            if (status === 401) {
                logout();
                toast.error("Phiên đăng nhập đã hết hạn!");
            } else {
                toast.error(message);
            }
            throw err; // Throw the original error instead of creating a new one
        }
    };

    return useMutation({
        mutationFn,
        ...options,
        onSuccess: (data) => {
            if (options.invalidateKeys)
                options.invalidateKeys.forEach((key) =>
                    queryClient.invalidateQueries([key])
                );
            options.onSuccess?.(data);
        },
    });

}