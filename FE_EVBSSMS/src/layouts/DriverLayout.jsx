import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, MapPin, Calendar, Clock, User, LogOut, Battery } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigation = [
    { name: "Trang chủ", href: "/driver/dashboard", icon: Home },
    { name: "Trạm đổi pin", href: "/driver/stations", icon: MapPin },
    { name: "Lịch của tôi", href: "/driver/bookings", icon: Calendar },
    { name: "Lịch sử", href: "/driver/history", icon: Clock },
];

export default function DriverLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getInitials = (name) => {
        if (!name) return "D";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/driver/dashboard" className="flex items-center gap-2">
                            <Battery className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900">
                                EV Swap Station
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link key={item.name} to={item.href}>
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            className="gap-2"
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.name}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-blue-600 text-white">
                                            {getInitials(user?.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden md:inline">
                                        {user?.fullName || "Tài xế"}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate("/driver/profile")}>
                                    <User className="mr-2 h-4 w-4" />
                                    Thông tin cá nhân
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="md:hidden flex overflow-x-auto pb-2 gap-2">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link key={item.name} to={item.href}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        size="sm"
                                        className="gap-2 whitespace-nowrap"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.name}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="container mx-auto px-4 py-6">
                    <div className="text-center text-sm text-gray-600">
                        © 2025 EV Battery Swap Station. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}