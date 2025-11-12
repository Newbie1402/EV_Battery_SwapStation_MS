import { motion } from "framer-motion";
import { Battery, MapPin, Calendar, Clock, TrendingUp, Zap, Info } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DriverDashboard() {
    const { userId } = useAuthStore();
    const navigate = useNavigate();

    const fadeVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const stats = [
        {
            title: "Lượt đổi pin",
            value: "24",
            icon: Battery,
            color: "from-emerald-500 to-green-500",
            bgColor: "bg-emerald-50",
            change: "+12%",
        },
        {
            title: "Trạm yêu thích",
            value: "5",
            icon: MapPin,
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-50",
            change: "+2",
        },
        {
            title: "Lịch sắp tới",
            value: "3",
            icon: Calendar,
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-50",
            change: "Hôm nay",
        },
        {
            title: "Thời gian tiết kiệm",
            value: "2.5h",
            icon: Clock,
            color: "from-orange-500 to-red-500",
            bgColor: "bg-orange-50",
            change: "Tuần này",
        },
    ];

    const quickActions = [
        {
            title: "Đặt lịch đổi pin",
            description: "Tìm và đặt lịch tại trạm gần bạn",
            icon: Calendar,
            color: "from-emerald-500 to-cyan-500",
            action: () => navigate("/driver/stations"),
        },
        {
            title: "Xem lịch của tôi",
            description: "Quản lý các lịch đã đặt",
            icon: Clock,
            color: "from-blue-500 to-purple-500",
            action: () => navigate("/driver/bookings"),
        },
        {
            title: "Tìm trạm gần nhất",
            description: "Xem danh sách trạm đổi pin",
            icon: MapPin,
            color: "from-orange-500 to-pink-500",
            action: () => navigate("/driver/stations"),
        },
    ];

    const recentBookings = [
        {
            id: "1",
            station: "Trạm Cầu Giấy",
            date: "2025-01-15",
            time: "14:00",
            status: "confirmed",
        },
        {
            id: "2",
            station: "Trạm Hoàn Kiếm",
            date: "2025-01-12",
            time: "09:30",
            status: "completed",
        },
        {
            id: "3",
            station: "Trạm Đống Đa",
            date: "2025-01-10",
            time: "16:00",
            status: "completed",
        },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            confirmed: { label: "Đã xác nhận", variant: "default" },
            completed: { label: "Hoàn thành", variant: "secondary" },
            cancelled: { label: "Đã hủy", variant: "destructive" },
        };
        return statusMap[status] || { label: status, variant: "outline" };
    };

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeVariants}
                    className="mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Chào mừng trở lại! 👋
                    </h1>
                    <p className="text-gray-600">
                        ID: <span className="font-medium">{userId}</span>
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial="hidden"
                            animate="visible"
                            variants={fadeVariants}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className={`${stat.bgColor} border-none hover:shadow-lg transition-shadow`}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 mb-1">
                                                {stat.title}
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900">
                                                {stat.value}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {stat.change}
                                            </p>
                                        </div>
                                        <div
                                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                                        >
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeVariants}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {quickActions.map((action, idx) => (
                            <Card
                                key={idx}
                                className="cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
                                onClick={action.action}
                            >
                                <CardHeader>
                                    <div
                                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg`}
                                    >
                                        <action.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <CardTitle className="text-xl">{action.title}</CardTitle>
                                    <CardDescription>{action.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Bookings */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeVariants}
                    transition={{ delay: 0.6 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Lịch đổi pin gần đây</h2>
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/driver/bookings")}
                            className="text-emerald-600 hover:text-emerald-700"
                        >
                            Xem tất cả →
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-200">
                                {recentBookings.map((booking, idx) => (
                                    <div
                                        key={booking.id}
                                        className="p-6 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                                                    <Battery className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-1">
                                                        {booking.station}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {booking.date}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {booking.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant={getStatusBadge(booking.status).variant}>
                                                {getStatusBadge(booking.status).label}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Tips Section */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeVariants}
                    transition={{ delay: 0.8 }}
                    className="mt-8"
                >
                    <Card className="bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 border-none text-white">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                    <Info className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">
                                        💡 Mẹo sử dụng hiệu quả
                                    </h3>
                                    <p className="text-white/90 text-sm leading-relaxed">
                                        Đặt lịch trước để tiết kiệm thời gian chờ đợi. Trạm đổi pin hoạt động
                                        hiệu quả nhất vào khung giờ 8:00 - 10:00 và 14:00 - 16:00.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

