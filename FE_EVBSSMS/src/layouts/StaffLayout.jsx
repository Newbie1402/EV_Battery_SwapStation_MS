import { Outlet } from "react-router-dom";
import {LayoutDashboard, Battery, History, ClipboardCheck, Package, Building2, Calendar, Layers} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function StaffLayout() {
    const { role } = useAuthStore();

    const staffMenuItems = [
        {
            label: "Tổng quan",
            path: "/staff/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Quản lý",
            icon: Layers,
            submenu: [
                {
                    label: "Quản lý Pin",
                    path: "/staff/batteries",
                    icon: Battery,
                },
                {
                    label: "Quản lý Đặt lịch",
                    path: "/staff/bookings",
                    icon: Calendar,
                },
            ],
        },
        {
            label: "Lịch sử đổi pin",
            path: "/staff/history",
            icon: History,
        },
        {
            label: "Thông tin trạm",
            path: "/staff/station-info",
            icon: Building2,
        },
        {
            label: "Hỗ trợ",
            path: "/staff/support",
            icon: ClipboardCheck,
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header menuItems={staffMenuItems} role={role || "STAFF"} />

            <main className="flex-1 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    );
}

