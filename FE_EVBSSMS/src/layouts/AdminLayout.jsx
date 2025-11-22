import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIReportWidget from "@/components/AIReportWidget";
import {
    LayoutDashboard,
    Users,
    Battery,
    MapPin,
    BarChart3,
    Package,
    Car,
    Layers,
    Ticket,
    BatteryCharging
} from "lucide-react";

export default function AdminLayout() {
    const adminMenuItems = [
        {
            label: "Tổng quan",
            path: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Quản lý",
            icon: Layers,
            submenu: [
                {
                    label: "Người dùng",
                    path: "/admin/users",
                    icon: Users,
                },
                {
                    label: "Phương tiện",
                    path: "/admin/vehicles",
                    icon: Car,
                },
                {
                    label: "Trạm đổi pin",
                    path: "/admin/stations",
                    icon: MapPin,
                },
                {
                    label: "Gói dịch vụ",
                    path: "/admin/packages",
                    icon: Package,
                },
                {
                    label: "Quản lý pin",
                    path: "/admin/batteries",
                    icon: Battery,
                },
            ],
        },
        {
            label: "Báo cáo",
            path: "/admin/reports",
            icon: BarChart3,
        },
        {
            label: "Yêu cầu chuyển pin",
            path: "/admin/battery-transfers",
            icon: BatteryCharging,
        },
        {
            label: "Hỗ trợ",
            path: "/admin/support-tickets",
            icon: Ticket,
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header menuItems={adminMenuItems} role="ADMIN" />

            <main className="flex-1 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>

            <Footer />
            <AIReportWidget />
        </div>
    );
}
