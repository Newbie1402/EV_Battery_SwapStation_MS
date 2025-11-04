import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <div className="h-screen flex flex-col justify-center items-center bg-gray-50">
            <h1 className="text-5xl font-bold text-blue-600">404</h1>
            <p className="text-gray-500 mt-2">Trang bạn tìm không tồn tại</p>
            <Link to="/" className="mt-4 text-blue-500 hover:underline">
                Quay lại trang chủ
            </Link>
        </div>
    );
}
