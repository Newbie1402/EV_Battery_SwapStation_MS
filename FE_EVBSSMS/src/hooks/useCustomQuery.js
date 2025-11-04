import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { useAuthStore } from "../store/authStore";

/**
 * Custom hook sử dụng React Query + Axios instance
 * @param {string|array} key - Query key (unique)
 * @param {string} queryFnOrUrl - service API function (ví dụ: sellerApi.createSeller)
 * @param {object} options - Các tùy chọn mở rộng (enabled, staleTime, refetchInterval, ...)
 * @returns React Query result object (data, isLoading, isError, refetch, ...)
 */

//Dùng cho các GET request
export default function useCustomQuery(key, queryFnOrUrl, options = {}) {
    const { logout } = useAuthStore();

    const fetchData = async () => {
        try {
            const res = typeof queryFnOrUrl === "string"
                ? await axiosInstance.get(queryFnOrUrl)
                : await queryFnOrUrl();

            return res.data || res;
        } catch (err) {
            const status = err?.response?.status;
            if (status === 401) {
                logout();
            }
            throw err;
        }
    };

    return useQuery({
        queryKey: Array.isArray(key) ? key : [key],
        queryFn: fetchData,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        retry: 1,
        ...options,
    });
}