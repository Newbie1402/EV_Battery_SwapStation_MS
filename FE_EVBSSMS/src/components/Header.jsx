import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {Zap, Menu, X, LogOut, User, Settings, ChevronDown, TicketCheck, LayoutDashboard} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { userApi } from "@/api/userApi";
import { authApi } from "@/api/authApi";
import toast from "react-hot-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Header({ menuItems = [], role = "" }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { logout, userId, user, updateUser, refreshToken } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch user profile nếu chưa có trong store
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (userId && !user) {
                try {
                    const profileData = await userApi.getProfileUser();
                    updateUser(profileData);
                } catch (error) {
                    console.error("Failed to fetch user profile:", error);
                    // Không hiển thị toast error vì có thể là token expired
                }
            }
        };

        fetchUserProfile();
    }, [userId, user, updateUser]);

    const handleLogout = async () => {
        try {
            // Gọi API logout nếu có refreshToken
            if (refreshToken) {
                await authApi.logout(refreshToken);
            }

            // Clear local state
            logout();

            toast.success("Đăng xuất thành công!");
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error);
            // Vẫn logout ở client side dù API có lỗi
            logout();
            toast.error("Đã đăng xuất khỏi hệ thống");
            navigate("/");
        }
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
        // Ưu tiên lấy từ user.fullName
        if (user?.fullName) {
            const names = user.fullName.trim().split(" ");
            if (names.length >= 2) {
                // Lấy chữ cái đầu của tên và họ
                return (names[names.length - 1][0] + names[0][0]).toUpperCase();
            }
            return user.fullName.substring(0, 2).toUpperCase();
        }

        // Fallback về userId
        if (userId !== undefined && userId !== null && userId !== "") {
            const str = String(userId).trim();
            return (str.slice(0, 2) || "U").toUpperCase();
        }

        // Fallback về role
        return role ? role.substring(0, 2).toUpperCase() : "U";
    };

    const getUserDisplayName = () => {
        return user?.fullName || getRoleDisplayName(role);
    };

    const isActivePath = (path) => {
        return location.pathname === path;
    };

    return (
        <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-slate-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
                        <div className="w-10 h-10 rounded-lg bg-[#135bec] flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 hidden sm:block">
                            EV Battery Swap
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-2">
                        {menuItems.map((item, idx) => {
                            // Nếu có submenu, hiển thị dropdown
                            if (item.submenu && item.submenu.length > 0) {
                                return (
                                    <DropdownMenu key={idx}>
                                        <DropdownMenuTrigger asChild>
                                            <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-[#135bec] hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer">
                                                {item.icon && <item.icon className="w-4 h-4" strokeWidth={2} />}
                                                {item.label}
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-56">
                                            {item.submenu.map((subItem, subIdx) => (
                                                <DropdownMenuItem
                                                    key={subIdx}
                                                    onClick={() => navigate(subItem.path)}
                                                    className="cursor-pointer"
                                                >
                                                    {subItem.icon && <subItem.icon className="w-4 h-4 mr-2" />}
                                                    {subItem.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                );
                            }

                            // Menu thông thường
                            const isActive = isActivePath(item.path);
                            return (
                                <Link
                                    key={idx}
                                    to={item.path}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        isActive
                                            ? "bg-[#135bec] text-white"
                                            : "text-slate-700 hover:text-[#135bec] hover:bg-slate-100"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {item.icon && <item.icon className="w-4 h-4" strokeWidth={2} />}
                                        {item.label}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
                        {userId ? (
                            <>
                                {/* Desktop User Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="hidden md:flex items-center gap-2 hover:bg-slate-100 rounded-full p-2 pr-4 transition cursor-pointer">
                                            <Avatar className="w-8 h-8">
                                                {user?.avatar && <AvatarImage src={user.avatar} alt={user.fullName} />}
                                                <AvatarFallback className="bg-[#135bec] text-white text-xs">
                                                    {getUserInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium text-slate-700">
                                                {getUserDisplayName()}
                                            </span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56" modal={false}>
                                        <DropdownMenuLabel>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">
                                                    {user?.fullName || getRoleDisplayName(role)}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {user?.email || `ID: ${userId}`}
                                                </span>
                                            </div>
                                        </DropdownMenuLabel>
                                        {role === 'DRIVER' && (
                                            <DropdownMenuLabel className="pt-0">
                                                <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                                    Tài xế
                                                </span>
                                            </DropdownMenuLabel>
                                        )}
                                        <DropdownMenuSeparator />
                                        {role === 'DRIVER' && [
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() => navigate(`/driver/profile`)}
                                            >
                                                <User className="w-4 h-4 mr-2" />
                                                Thông tin cá nhân
                                            </DropdownMenuItem>,
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() => navigate(`/driver/support`)}
                                                >
                                                <TicketCheck className="w-4 h-4 mr-2" />
                                                Hỗ trợ
                                            </DropdownMenuItem>
                                        ]}
                                        {role === 'ADMIN' && [
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={() => navigate(`/admin/dashboard`)}
                                        >
                                            <LayoutDashboard className="w-4 h-4 mr-2" />
                                            Trang quản trị
                                        </DropdownMenuItem>
                                    ]}
                                        {role === 'STAFF' && [
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() => navigate(`/staff/dashboard`)}
                                            >
                                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                                Trang quản trị
                                            </DropdownMenuItem>
                                        ]}
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
                                <Button className="bg-[#135bec] hover:bg-[#135bec]/90 text-white">
                                    Đăng nhập
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && userId && (
                    <div className="md:hidden py-4 border-t border-slate-200">
                        <nav className="flex flex-col gap-2">
                            {menuItems.map((item, idx) => {
                                const isActive = isActivePath(item.path);
                                return (
                                    <Link
                                        key={idx}
                                        to={item.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                            isActive
                                                ? "bg-[#135bec] text-white"
                                                : "text-slate-700 hover:bg-slate-100"
                                        }`}
                                    >
                                        {item.icon && <item.icon className="w-5 h-5" strokeWidth={2} />}
                                        {item.label}
                                    </Link>
                                );
                            })}
                            <div className="border-t border-slate-200 my-2" />
                            <div className="flex items-center gap-3 px-4 py-2">
                                <Avatar className="w-10 h-10">
                                    {user?.avatar && <AvatarImage src={user.avatar} alt={user.fullName} />}
                                    <AvatarFallback className="bg-[#135bec] text-white">
                                        {getUserInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-900">
                                        {user?.fullName || getRoleDisplayName(role)}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {user?.email || `ID: ${userId}`}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
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
