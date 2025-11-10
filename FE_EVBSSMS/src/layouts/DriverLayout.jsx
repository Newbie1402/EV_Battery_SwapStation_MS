import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home, MapPin, Battery, Calendar, History, Wallet, User } from "lucide-react";

export default function DriverLayout() {
    const driverMenuItems = [
        {
            label: "Trang chủ",
            path: "/driver/home",
            icon: Home,
        },
        {
            label: "Tìm trạm",
            path: "/driver/find-station",
            icon: MapPin,
        },
        {
            label: "Đặt lịch đổi pin",
            path: "/driver/booking",
            icon: Calendar,
        },
        {
            label: "Pin của tôi",
            path: "/driver/my-battery",
            icon: Battery,
        },
        {
            label: "Lịch sử",
            path: "/driver/history",
            icon: History,
        },
        {
            label: "Ví của tôi",
            path: "/driver/wallet",
            icon: Wallet,
        },
        {
            label: "Tài khoản",
            path: "/driver/profile",
            icon: User,
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
            <Header menuItems={driverMenuItems} role="DRIVER" />

            <main className="flex-1 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    );
}

