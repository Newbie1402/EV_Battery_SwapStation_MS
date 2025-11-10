import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LayoutDashboard, Battery, Package, QrCode, ClipboardCheck, History } from "lucide-react";

export default function StaffLayout() {
    const staffMenuItems = [
        {
            label: "Bảng điều khiển",
            path: "/staff/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Quản lý pin",
            path: "/staff/batteries",
            icon: Battery,
        },
        {
            label: "Đơn đổi pin",
            path: "/staff/swap-orders",
            icon: Package,
        },
        {
            label: "Quét mã QR",
            path: "/staff/scan",
            icon: QrCode,
        },
        {
            label: "Kiểm tra pin",
            path: "/staff/battery-check",
            icon: ClipboardCheck,
        },
        {
            label: "Lịch sử giao dịch",
            path: "/staff/history",
            icon: History,
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
            <Header menuItems={staffMenuItems} role="STAFF" />

            <main className="flex-1 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    );
}

