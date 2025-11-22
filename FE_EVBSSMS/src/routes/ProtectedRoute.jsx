import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ element, allowedRoles = [] }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const status = localStorage.getItem("status");

    // Nếu chưa login → chuyển về /login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Nếu status là PENDING_VERIFICATION → chuyển về /verify-registration
    // (Chỉ áp dụng cho các route không phải verify-registration)
    if (status === "PENDING_VERIFICATION" && window.location.pathname !== "/verify-registration") {
        return <Navigate to="/verify-registration" replace />;
    }

    // Nếu login nhưng sai quyền → chuyển về /
    if (allowedRoles.length && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    // Nếu có children trong layout → render Outlet
    const Element = element.type || element;
    return <Element><Outlet /></Element>;
};

export default ProtectedRoute;
