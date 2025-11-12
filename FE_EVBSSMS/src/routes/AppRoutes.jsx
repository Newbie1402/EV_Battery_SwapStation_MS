import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";

// Lazy load pages
const HomePage = lazy(() => import("../pages/HomePage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

//Layouts
const DriverLayout = lazy(() => import("../layouts/DriverLayout"));
const StaffLayout = lazy(() => import("../layouts/StaffLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));

//Driver Pages
const DriverDashboardPage = lazy(() => import("../pages/driver/DriverDashboard"));
const DriverStationsPage = lazy(() => import("../pages/driver/StationListPage"));
const DriverBookingsPage = lazy(() => import("../pages/driver/MyBookingsPage"));
//Staff Pages

//Admin Pages

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
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Drivers Routes */}
                    <Route
                        path="/driver/"
                        element={
                            <ProtectedRoute
                                element={<DriverLayout />}
                                allowedRoles={["DRIVER"]}/>}
                    >
                        <Route path="dashboard" element={<DriverDashboardPage />} />
                        <Route path="stations" element={<DriverStationsPage />} />
                        <Route path="bookings" element={<DriverBookingsPage />} />
                    </Route>

                    {/* Staff Routes */}

                    {/* Admin Routes */}

                    {/* 404 Not Found */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </>
    );
}
