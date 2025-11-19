import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Battery, Package, ClipboardCheck, History, Zap, Bell, Menu, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";

export default function StaffLayout() {
    const { logout } = useAuthStore();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const staffMenuItems = [
        {
            label: "Tổng quan",
            path: "/staff/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Quản lý Pin",
            path: "/staff/batteries",
            icon: Battery,
        },
        {
            label: "Lịch sử đổi",
            path: "/staff/history",
            icon: History,
        },
        {
            label: "Kiểm tra pin",
            path: "/staff/battery-check",
            icon: ClipboardCheck,
        },
        {
            label: "Bảo trì",
            path: "/staff/maintenance",
            icon: Package,
        },
    ];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col">
            <div className="flex h-full grow">
                {/* Sidebar */}
                <aside className={`
                    sticky top-0 h-screen flex-col w-64 border-r border-slate-200 dark:border-slate-700 
                    bg-white dark:bg-slate-800
                    ${isSidebarOpen ? 'flex' : 'hidden lg:flex'}
                    fixed lg:relative z-50 lg:z-auto
                `}>
                    {/* Logo */}
                    <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="size-7 text-primary">
                            <Zap className="w-7 h-7" />
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                            PowerSwap
                        </h2>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col p-4 gap-2">
                        {staffMenuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                                        isActive
                                            ? "bg-primary-50 dark:bg-primary-900/40 text-primary dark:text-white font-semibold"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    }`
                                }
                            >
                                <item.icon className="w-6 h-6" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 sm:px-8 py-3 h-16">
                        <div className="flex items-center gap-4">
                            <button
                                className="lg:hidden p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                Quản lý trạm
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <Bell className="w-6 h-6" />
                            </button>
                            <div className="relative group">
                                <button className="flex items-center gap-2">
                                    <div className="size-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="hidden sm:flex flex-col items-start">
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            Staff
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            Quản lý trạm
                                        </span>
                                    </div>
                                </button>

                                {/* Dropdown menu */}
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main */}
                    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-slate-900">
                        <div className="max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

