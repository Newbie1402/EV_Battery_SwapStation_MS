import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";

// Lazy load pages
const HomePage = lazy(() => import("../pages/HomePage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

export default function AppRoutes() {
    return (
        <>
            <ScrollToTop />
            <Suspense
                fallback={
                    <div className="flex justify-center items-center h-screen text-gray-500">
                        Đang tải...
                    </div>
                }
            >
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />

                    {/* Drivers Routes */}

                    {/* Staff Routes */}

                    {/* Admin Routes */}

                    {/* 404 Not Found */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </>
    );
}
