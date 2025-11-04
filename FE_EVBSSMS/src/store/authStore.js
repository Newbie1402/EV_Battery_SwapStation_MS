import { create } from "zustand";

export const useAuthStore = create((set) => ({
    userId: localStorage.getItem("userId") || null,
    role: localStorage.getItem("role") || null,
    token: localStorage.getItem("token") || null,

    // Đăng nhập (lưu thông tin trả về từ BE)
    login: ({ userId, token, role }) => {
        localStorage.setItem("userId", userId);
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        set({ userId, token, role });
    },

    // Đăng xuất (xoá toàn bộ dữ liệu)
    logout: () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        set({ userId: null, token: null, role: null });
    },

    // Khôi phục trạng thái (dùng trong main.jsx hoặc App.jsx)
    restoreAuth: () => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        set({ userId, token, role });
    },
}));