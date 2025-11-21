import { create } from "zustand";

export const useAuthStore = create((set) => ({
    userId: localStorage.getItem("userId") || null,
    employeeId: localStorage.getItem("employeeId") || null,
    role: localStorage.getItem("role") || null,
    token: localStorage.getItem("token") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    stationId: localStorage.getItem("stationId") || null,
    status: localStorage.getItem("status") || null,
    user: JSON.parse(localStorage.getItem("user") || "null"),

    // Đăng nhập (lưu thông tin trả về từ BE)
    login: ({ userId, employeeId, token, refreshToken, role, stationId, status, user }) => {
        localStorage.setItem("userId", userId);
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        if (employeeId) {
            localStorage.setItem("employeeId", employeeId);
        }
        if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
        }
        if (stationId) {
            localStorage.setItem("stationId", stationId);
        }
        if (status) {
            localStorage.setItem("status", status);
        }
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        }
        set({
            userId,
            employeeId: employeeId || null,
            token,
            refreshToken: refreshToken || null,
            role,
            stationId: stationId || null,
            status: status || null,
            user: user || null
        });
    },

    // Đăng xuất (xoá toàn bộ dữ liệu)
    logout: () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("employeeId");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        localStorage.removeItem("stationId");
        localStorage.removeItem("status");
        localStorage.removeItem("user");
        set({
            userId: null,
            employeeId: null,
            token: null,
            refreshToken: null,
            role: null,
            stationId: null,
            status: null,
            user: null
        });
    },

    // Cập nhật status
    updateStatus: (status) => {
        localStorage.setItem("status", status);
        set({ status });
    },

    // Cập nhật user profile
    updateUser: (user) => {
        localStorage.setItem("user", JSON.stringify(user));
        set({ user });
    },

    // Khôi phục trạng thái (dùng trong main.jsx hoặc App.jsx)
    restoreAuth: () => {
        const userId = localStorage.getItem("userId");
        const employeeId = localStorage.getItem("employeeId");
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");
        const role = localStorage.getItem("role");
        const stationId = localStorage.getItem("stationId");
        const status = localStorage.getItem("status");
        const user = JSON.parse(localStorage.getItem("user") || "null");
        set({ userId, employeeId, token, refreshToken, role, stationId, status, user });
    },
}));