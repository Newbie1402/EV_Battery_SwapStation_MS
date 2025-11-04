import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ element, allowedRoles = [] }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Nếu chưa login → chuyển về /login
    if (!token) {
        return <Navigate to="/login" replace />;
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
