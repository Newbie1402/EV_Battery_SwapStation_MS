import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Menu, X, LogOut, User, Settings } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Header({ menuItems = [], role = "" }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { logout, userId } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const getRoleDisplayName = (role) => {
        const roleMap = {
            ADMIN: "Quản trị viên",
            STAFF: "Nhân viên",
            DRIVER: "Tài xế"
        };
        return roleMap[role] || "Người dùng";
    };

    const getUserInitials = () => {
        if (userId) {
            return userId.substring(0, 2).toUpperCase();
        }
        return role ? role.substring(0, 2).toUpperCase() : "U";
    };

    return (
        <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-xl z-50 shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent hidden sm:block">
                            EV Battery Swap
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-6">
                        {menuItems.map((item, idx) => (
                            <Link
                                key={idx}
                                to={item.path}
                                className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition"
                            >
                                <div className="flex items-center gap-2">
                                    {item.icon && <item.icon className="w-4 h-4" />}
                                    {item.label}
                                </div>
                            </Link>
                        ))}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
                        {userId ? (
                            <>
                                {/* Desktop User Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="hidden md:flex items-center gap-2 hover:bg-gray-100 rounded-full p-2 pr-4 transition">
                                            <Avatar className="w-8 h-8">
                                                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-500 text-white text-xs">
                                                    {getUserInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium text-gray-700">
                                                {getRoleDisplayName(role)}
                                            </span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{getRoleDisplayName(role)}</span>
                                                <span className="text-xs text-gray-500">ID: {userId}</span>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="cursor-pointer">
                                            <User className="w-4 h-4 mr-2" />
                                            Thông tin cá nhân
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Cài đặt
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="cursor-pointer text-red-600 focus:text-red-600"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Đăng xuất
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Mobile Menu Toggle */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                >
                                    {isMenuOpen ? (
                                        <X className="w-6 h-6" />
                                    ) : (
                                        <Menu className="w-6 h-6" />
                                    )}
                                </Button>
                            </>
                        ) : (
                            /* Login Button for non-authenticated users */
                            <Link to="/login">
                                <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white">
                                    Đăng nhập
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && userId && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <nav className="flex flex-col gap-3">
                            {menuItems.map((item, idx) => (
                                <Link
                                    key={idx}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                >
                                    {item.icon && <item.icon className="w-5 h-5" />}
                                    {item.label}
                                </Link>
                            ))}
                            <div className="border-t border-gray-200 my-2" />
                            <div className="flex items-center gap-3 px-4 py-2">
                                <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-500 text-white">
                                        {getUserInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {getRoleDisplayName(role)}
                                    </span>
                                    <span className="text-xs text-gray-500">ID: {userId}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                                <LogOut className="w-5 h-5" />
                                Đăng xuất
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

