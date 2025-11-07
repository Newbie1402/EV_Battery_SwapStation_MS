import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LayoutDashboard, Users, Battery, MapPin, Settings, BarChart3, Package } from "lucide-react";

export default function AdminLayout() {
    const adminMenuItems = [
        {
            label: "Tổng quan",
            path: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Người dùng",
            path: "/admin/users",
            icon: Users,
        },
        {
            label: "Trạm đổi pin",
            path: "/admin/stations",
            icon: MapPin,
        },
        {
            label: "Quản lý pin",
            path: "/admin/batteries",
            icon: Battery,
        },
        {
            label: "Đơn hàng",
            path: "/admin/orders",
            icon: Package,
        },
        {
            label: "Báo cáo",
            path: "/admin/reports",
            icon: BarChart3,
        },
        {
            label: "Cài đặt",
            path: "/admin/settings",
            icon: Settings,
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
            <Header menuItems={adminMenuItems} role="ADMIN" />

            <main className="flex-1 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    );
}

