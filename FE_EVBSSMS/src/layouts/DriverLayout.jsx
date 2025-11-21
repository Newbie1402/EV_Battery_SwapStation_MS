import { Outlet } from "react-router-dom";
import { Home, MapPin, Calendar, Package, User, Receipt } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const driverMenuItems = [
    { label: "Trang chủ", path: "/driver/dashboard", icon: Home },
    { label: "Trạm đổi pin", path: "/driver/stations", icon: MapPin },
    { label: "Lịch của tôi", path: "/driver/bookings", icon: Calendar },
    { label: "Gói của tôi", path: "/driver/packages", icon: Package },
    { label: "Lịch sử thanh toán", path: "/driver/my-payment", icon: Receipt },
    { label: "Hồ sơ", path: "/driver/profile", icon: User },
];

export default function DriverLayout() {
    const { role } = useAuthStore();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Header Component */}
            <Header menuItems={driverMenuItems} role={role || "DRIVER"} />

            {/* Main Content */}
            <main className="relative z-10 pt-16">
                <Outlet />
            </main>

            {/* Footer Component */}
            <Footer />
        </div>
    );
}