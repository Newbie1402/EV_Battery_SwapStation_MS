import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";

// Lazy load pages
const HomePage = lazy(() => import("../pages/HomePage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const PricingPage = lazy(() => import("../pages/PricingPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const VerifyRegistrationPage = lazy(() => import("../pages/VerifyRegistrationPage"));

//Layouts
const DriverLayout = lazy(() => import("../layouts/DriverLayout"));
const StaffLayout = lazy(() => import("../layouts/StaffLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));

//Driver Pages
const DriverDashboardPage = lazy(() => import("../pages/driver/DriverDashboard"));
const DriverStationsPage = lazy(() => import("../pages/driver/StationListPage"));
const DriverBookingsPage = lazy(() => import("../pages/driver/MyBookingsPage"));
const DriverProfilePage = lazy(() => import("../pages/driver/DriverProfilePage"));
const PaymentPackagePage = lazy(() => import("../pages/driver/PaymentPackagePage"));
const PaymentSuccessPage = lazy(() => import("../pages/driver/PaymentSuccessPage"));
const MyPackagesPage = lazy(() => import("../pages/driver/MyPackagesPage"));
const MyPaymentPage = lazy(() => import("../pages/driver/MyPaymentPage"));
const DriverSupportTicketPage = lazy(() => import("../pages/driver/DriverSupportTicketPage.jsx"));

//Staff Pages
const StaffDashboardPage = lazy(() => import("../pages/staff/StaffDashboard"));
const StaffBatteryManagementPage = lazy(() => import("../pages/staff/StaffBatteryManagement"));
const StaffBookingManagementPage = lazy(() => import("../pages/staff/StaffBookingManagementPage"));
const StaffStationInfoPage = lazy(() => import("../pages/staff/StaffStationInfoPage"));
const StaffSwapHistoryPage = lazy(() => import("../pages/staff/StaffSwapHistoryPage"));
const StaffRatingManagementPage = lazy(() => import("../pages/staff/StaffRatingManagementPage"));
const StaffSupportPage = lazy(() => import("../pages/staff/StaffSupportBatteryTransferPage"));

//Admin Pages
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminStationManagementPage = lazy(() => import("../pages/admin/StationManagementPage"));
const AdminPackagePlanManagementPage = lazy(() => import("../pages/admin/PackagePlanManagementPage"));
const AdminPackageSubscriptionsPage = lazy(() => import("../pages/admin/PackageSubscriptionsPage"));
const AdminUserManagementPage = lazy(() => import("../pages/admin/UserManagementPage"));
const AdminVehicleManagementPage = lazy(() => import("../pages/admin/VehicleManagementPage"));
const AdminBatteryManagementPage = lazy(() => import("../pages/admin/BatteryManagementPage"));
const AdminBatteryDispatchPage = lazy(() => import("../pages/admin/BatteryDispatchPage"));
const AdminReportStaticsPage = lazy(() => import("../pages/admin/ReportStaticsPage.jsx"));
const AdminBatteryTransferRequestsPage = lazy(() => import("../pages/admin/BatteryTransferRequestsPage"));
const AdminSupportTicketPage = lazy(() => import("../pages/admin/SupportTicketPage"));

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
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-registration" element={<VerifyRegistrationPage />} />

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
                        <Route path="packages" element={<MyPackagesPage />} />
                        <Route path="profile" element={<DriverProfilePage />} />
                        <Route path="payment-package/:packageId" element={<PaymentPackagePage />} />
                        <Route path="payment-success" element={<PaymentSuccessPage />} />
                        <Route path="my-payment" element={<MyPaymentPage />} />
                        <Route path="support" element={<DriverSupportTicketPage />} />
                    </Route>

                    {/* Staff Routes */}
                    <Route
                        path="/staff/"
                        element={
                            <ProtectedRoute
                                element={<StaffLayout />}
                                allowedRoles={["STAFF"]}/>}
                    >
                        <Route path="dashboard" element={<StaffDashboardPage />} />
                        <Route path="batteries" element={<StaffBatteryManagementPage />} />
                        <Route path="bookings" element={<StaffBookingManagementPage />} />
                        <Route path="station-info" element={<StaffStationInfoPage />} />
                        <Route path="history" element={<StaffSwapHistoryPage />} />
                        <Route path="ratings" element={<StaffRatingManagementPage />} />
                        <Route path="support" element={<StaffSupportPage />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route
                        path="/admin/"
                        element={
                            <ProtectedRoute
                                element={<AdminLayout />}
                                allowedRoles={["ADMIN"]}/>}
                    >
                        <Route path="dashboard" element={<AdminDashboardPage />} />
                        <Route path="users" element={<AdminUserManagementPage />} />
                        <Route path="vehicles" element={<AdminVehicleManagementPage />} />
                        <Route path="stations" element={<AdminStationManagementPage />} />
                        <Route path="stations/:stationId/battery-dispatch" element={<AdminBatteryDispatchPage />} />
                        <Route path="packages" element={<AdminPackagePlanManagementPage />} />
                        <Route path="packages/:packageId/subscriptions" element={<AdminPackageSubscriptionsPage />} />
                        <Route path="batteries" element={<AdminBatteryManagementPage />} />
                        <Route path="reports" element={<AdminReportStaticsPage />} />
                        <Route path="battery-transfers" element={<AdminBatteryTransferRequestsPage />} />
                        <Route path="support-tickets" element={<AdminSupportTicketPage />} />
                    </Route>

                    {/* 404 Not Found */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </>
    );
}
