import { motion } from "framer-motion";
import {
    Users,
    MapPin,
    Battery,
    Activity,
    AlertCircle,
    Package,
    CheckCircle,
    XCircle,
    BarChart3,
    Phone,
    TrendingUp,
    Lightbulb,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useCustomQuery from "@/hooks/useCustomQuery";
import { stationApi } from "@/api/stationApi";
import { bookingApi } from "@/api/bookingApi";

export default function AdminDashboard() {
    const { userId } = useAuthStore();
    const navigate = useNavigate();

    // Fetch data
    const { data: stationsData, isLoading: stationsLoading } = useCustomQuery(
        ["admin-stations"],
        () => stationApi.getAllStations()
    );

    const { data: upcomingBookingsData } = useCustomQuery(
        ["admin-upcoming-bookings"],
        bookingApi.getUpcomingBookings
    );

    const { data: overdueBookingsData } = useCustomQuery(
        ["admin-overdue-bookings"],
        bookingApi.getOverdueBookings
    );

    const fadeVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
    };

    // Calculate statistics
    const stations = stationsData || [];
    const upcomingBookings = upcomingBookingsData?.data || [];
    const overdueBookings = overdueBookingsData?.data || [];

    const activeStations = stations.filter((s) => s.status === "ACTIVE").length;
    const offlineStations = stations.filter((s) => s.status === "OFFLINE").length;
    const maintenanceStations = stations.filter((s) => s.status === "MAINTENANCE").length;

    const stats = [
        {
            title: "Tổng số trạm",
            value: stations.length.toString(),
            icon: MapPin,
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-50",
            change: `${activeStations} hoạt động`,
        },
        {
            title: "Tổng người dùng",
            value: "248",
            icon: Users,
            color: "from-emerald-500 to-green-500",
            bgColor: "bg-emerald-50",
            change: "+12% tháng này",
        },
        {
            title: "Đơn hàng hôm nay",
            value: upcomingBookings.length.toString(),
            icon: Package,
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-50",
            change: `${overdueBookings.length} quá hạn`,
        },
        {
            title: "Pin đang sử dụng",
            value: "85%",
            icon: Battery,
            color: "from-orange-500 to-red-500",
            bgColor: "bg-orange-50",
            change: "Tỷ lệ sử dụng",
        },
    ];

    const quickActions = [
        {
            title: "Quản lý trạm",
            description: "Thêm, sửa, xóa trạm đổi pin",
            icon: MapPin,
            color: "from-blue-500 to-cyan-500",
            action: () => navigate("/admin/stations"),
        },
        {
            title: "Quản lý người dùng",
            description: "Xem và quản lý tài khoản",
            icon: Users,
            color: "from-emerald-500 to-green-500",
            action: () => navigate("/admin/users"),
        },
        {
            title: "Quản lý pin",
            description: "Theo dõi trạng thái pin",
            icon: Battery,
            color: "from-purple-500 to-pink-500",
            action: () => navigate("/admin/batteries"),
        },
        {
            title: "Xem báo cáo",
            description: "Thống kê và phân tích dữ liệu",
            icon: BarChart3,
            color: "from-orange-500 to-red-500",
            action: () => navigate("/admin/reports"),
        },
    ];

    const systemAlerts = [
        {
            id: "1",
            type: "warning",
            title: "Trạm Hương Lộ 2",
            message: `${maintenanceStations} trạm đang bảo trì`,
            time: "10 phút trước",
            icon: AlertCircle,
        },
        {
            id: "2",
            type: "error",
            title: "Trạm Tỉnh Lộ 10",
            message: `${offlineStations} trạm offline`,
            time: "30 phút trước",
            icon: XCircle,
        },
        {
            id: "3",
            type: "success",
            title: "Hệ thống",
            message: "Cập nhật thành công",
            time: "1 giờ trước",
            icon: CheckCircle,
        },
    ];

    const getAlertStyles = (type) => {
        switch (type) {
            case "error":
                return {
                    bg: "bg-red-50",
                    icon: "text-red-600",
                    badge: "bg-red-100 text-red-700",
                };
            case "warning":
                return {
                    bg: "bg-yellow-50",
                    icon: "text-yellow-600",
                    badge: "bg-yellow-100 text-yellow-700",
                };
            case "success":
                return {
                    bg: "bg-green-50",
                    icon: "text-green-600",
                    badge: "bg-green-100 text-green-700",
                };
            default:
                return {
                    bg: "bg-gray-50",
                    icon: "text-gray-600",
                    badge: "bg-gray-100 text-gray-700",
                };
        }
    };

    const recentStations = stations.slice(0, 5);

    const getStatusBadge = (status) => {
        const statusMap = {
            ACTIVE: { label: "Hoạt động", variant: "default", color: "bg-green-100 text-green-700" },
            OFFLINE: { label: "Ngừng hoạt động", variant: "destructive", color: "bg-red-100 text-red-700" },
            MAINTENANCE: { label: "Bảo trì", variant: "secondary", color: "bg-yellow-100 text-yellow-700" },
        };
        return statusMap[status] || { label: status, variant: "outline", color: "bg-gray-100 text-gray-700" };
    };

    return (
        <div className="w-full min-h-screen bg-white text-gray-900 overflow-x-hidden">
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Welcome Section */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeVariants}
                        transition={{ duration: 0.8 }}
                        className="mb-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-4">
                            <Activity className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700">Admin Dashboard</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
                            <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                Bảng điều khiển quản trị
                            </span>
                        </h1>
                        <p className="text-lg text-gray-600">
                            ID: <span className="font-semibold text-gray-800">{userId}</span>
                        </p>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial="hidden"
                                animate="visible"
                                variants={fadeVariants}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                            >
                                <Card className={`${stat.bgColor} border border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-2`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                                            </div>
                                            <div
                                                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                                            >
                                                <stat.icon className="w-7 h-7 text-white" strokeWidth={2} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Quick Actions */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeVariants}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <h2 className="text-3xl font-bold text-black mb-6">Thao tác nhanh</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {quickActions.map((action, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial="hidden"
                                        animate="visible"
                                        variants={fadeVariants}
                                        transition={{ duration: 0.6, delay: 0.5 + idx * 0.1 }}
                                    >
                                        <Card
                                            className="cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-200 bg-white"
                                            onClick={action.action}
                                        >
                                            <CardHeader className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}
                                                    >
                                                        <action.icon className="w-6 h-6 text-white" strokeWidth={2} />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg mb-1 text-black">
                                                            {action.title}
                                                        </CardTitle>
                                                        <CardDescription className="text-gray-600">
                                                            {action.description}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* System Alerts */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeVariants}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-3xl font-bold text-black">Cảnh báo hệ thống</h2>
                                <Button variant="ghost" className="text-black hover:text-gray-700 font-semibold">
                                    Xem tất cả →
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {systemAlerts.map((alert, idx) => {
                                    const styles = getAlertStyles(alert.type);
                                    return (
                                        <motion.div
                                            key={alert.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.7 + idx * 0.1 }}
                                        >
                                            <Card className={`${styles.bg} border border-gray-200`}>
                                                <CardContent className="p-5">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`${styles.icon}`}>
                                                            <alert.icon className="w-6 h-6" strokeWidth={2} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between mb-1">
                                                                <h3 className="font-bold text-gray-900">{alert.title}</h3>
                                                                <span className="text-xs text-gray-500">{alert.time}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-700">{alert.message}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* Recent Stations */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeVariants}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-black">Trạm đổi pin</h2>
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/admin/stations")}
                                className="text-black hover:text-gray-700 font-semibold"
                            >
                                Xem tất cả →
                            </Button>
                        </div>

                        <Card className="border border-gray-200 shadow-lg bg-white">
                            <CardContent className="p-0">
                                {stationsLoading ? (
                                    <div className="p-8 text-center text-gray-500">Đang tải...</div>
                                ) : recentStations.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">Chưa có trạm nào</div>
                                ) : (
                                    <div className="divide-y divide-gray-200">
                                        {recentStations.map((station, idx) => (
                                            <motion.div
                                                key={station.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.9 + idx * 0.1 }}
                                                className="p-6 hover:bg-gray-50 transition-all cursor-pointer"
                                                onClick={() => navigate(`/admin/stations/${station.id}`)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                                            <MapPin className="w-7 h-7 text-white" strokeWidth={2} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-gray-900 mb-1 text-lg">
                                                                {station.stationName}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 mb-2">{station.address}</p>
                                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                <span className="flex items-center gap-1">
                                                                    <Battery className="w-4 h-4" />
                                                                    {station.availableSlots}/{station.totalSlots} slots
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Phone className="w-4 h-4" />
                                                                    {station.phoneNumber}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge className={`font-medium ${getStatusBadge(station.status).color}`}>
                                                        {getStatusBadge(station.status).label}
                                                    </Badge>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Info Section */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeVariants}
                        transition={{ duration: 0.8, delay: 1.0 }}
                        className="mt-12"
                    >
                        <Card className="bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 border-none text-white shadow-2xl rounded-3xl overflow-hidden relative">
                            {/* Background decoration */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                            </div>

                            <CardContent className="p-8 relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <TrendingUp className="w-8 h-8 text-white" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-2xl mb-3 text-white flex items-center gap-2">
                                            <Lightbulb className="w-6 h-6" />
                                            Thống kê hệ thống
                                        </h3>
                                        <p className="text-white/90 leading-relaxed text-lg">
                                            Hệ thống đang hoạt động ổn định với {activeStations} trạm đang hoạt động.
                                            Tổng số đơn hàng hôm nay: {upcomingBookings.length}. Tiếp tục theo dõi để
                                            đảm bảo chất lượng dịch vụ tốt nhất.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

