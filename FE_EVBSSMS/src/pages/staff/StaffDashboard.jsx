import {
    Battery,
    RefreshCw,
    Power,
    AlertCircle,
    Search,
    FileText,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useCustomQuery from "@/hooks/useCustomQuery";
import { stationApi } from "@/api";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

export default function StaffDashboard() {
    const { employeeId } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");

    // Lấy thông tin trạm mà staff đang được phân công (dùng employeeId)
    const {
        data: station,
        isLoading,
        isError
    } = useCustomQuery(
        ["staff-station", employeeId],
        () => stationApi.getStationByStaffCode(employeeId),
        {
            enabled: !!employeeId,
            onError: () => {
                toast.error("Không thể tải thông tin trạm");
            }
        }
    );

    const stationData = station?.data || station;

    // Lưu stationCode & stationName vào localStorage khi có dữ liệu trạm (đặt trước các early return)
    useEffect(() => {
        if (stationData?.stationCode) {
            const currentCode = localStorage.getItem("staffStationCode");
            const currentName = localStorage.getItem("staffStationName");
            const currentId = localStorage.getItem("staffStationId");
            if (currentId !== String(stationData.id)) {
                localStorage.setItem("staffStationId", String(stationData.id));
            }
            if (currentCode !== stationData.stationCode) {
                localStorage.setItem("staffStationCode", stationData.stationCode);
            }
            if (currentName !== stationData.stationName) {
                localStorage.setItem("staffStationName", stationData.stationName || "");
            }
        }
    }, [stationData?.stationCode, stationData?.stationName, stationData?.id]);

    // Hiển thị khi không có employeeId
    if (!employeeId) {
        return (
            <div className="space-y-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Không xác định được mã nhân viên. Vui lòng đăng nhập lại.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Hiển thị khi đang tải
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    // Hiển thị khi có lỗi
    if (isError || !station) {
        return (
            <div className="space-y-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Bạn chưa được phân công quản lý trạm nào. Vui lòng liên hệ quản trị viên.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Hàm xác định trạng thái hoạt động
    const getStationStatus = (status) => {
        switch (status) {
            case "ACTIVE":
                return {
                    label: "Bình thường",
                    iconBg: "bg-green-100 dark:bg-green-900/50",
                    iconColor: "text-green-600 dark:text-green-400",
                    dotColor: "bg-green-500",
                    textColor: "text-green-600 dark:text-green-400",
                };
            case "MAINTENANCE":
                return {
                    label: "Bảo trì",
                    iconBg: "bg-orange-100 dark:bg-orange-900/50",
                    iconColor: "text-orange-600 dark:text-orange-400",
                    dotColor: "bg-orange-500",
                    textColor: "text-orange-600 dark:text-orange-400",
                };
            default: // OFFLINE, INACTIVE
                return {
                    label: "Không hoạt động",
                    iconBg: "bg-red-100 dark:bg-red-900/50",
                    iconColor: "text-red-600 dark:text-red-400",
                    dotColor: "bg-red-500",
                    textColor: "text-red-600 dark:text-red-400",
                };
        }
    };

    const statusInfo = getStationStatus(stationData?.status);

    // Thống kê trạm
    const stats = [
        {
            title: "Pin Sẵn Sàng",
            value: stationData?.availableSlots || 0,
            total: stationData?.totalSlots || 0,
            icon: Battery,
            iconBg: "bg-primary-50 dark:bg-primary-900/50",
            iconColor: "text-primary dark:text-primary-300",
        },
        {
            title: "Lượt đổi pin (Hôm nay)",
            value: stationData?.todaySwaps || 128,
            icon: RefreshCw,
            iconBg: "bg-primary-50 dark:bg-primary-900/50",
            iconColor: "text-primary dark:text-primary-300",
        },
        {
            title: "Trạng Thái Hoạt Động",
            value: statusInfo.label,
            icon: Power,
            iconBg: statusInfo.iconBg,
            iconColor: statusInfo.iconColor,
            isStatus: true,
            statusInfo: statusInfo,
        },
        {
            title: "Cảnh báo",
            value: "0",
            icon: AlertCircle,
            iconBg: "bg-yellow-100 dark:bg-yellow-900/50",
            iconColor: "text-yellow-600 dark:text-yellow-400",
        },
    ];

    // Dữ liệu giao dịch mẫu
    const recentSwaps = [
        {
            id: "#TXN12345",
            customer: "Nguyễn Văn A",
            time: "12:34 25/04/2024",
            batteryType: "Pro-7kWh",
            status: "completed",
            cost: "50,000đ",
        },
        {
            id: "#TXN12344",
            customer: "Trần Thị B",
            time: "11:58 25/04/2024",
            batteryType: "Eco-5kWh",
            status: "completed",
            cost: "35,000đ",
        },
        {
            id: "#TXN12343",
            customer: "Lê Văn C",
            time: "10:15 25/04/2024",
            batteryType: "Pro-7kWh",
            status: "processing",
            cost: "50,000đ",
        },
        {
            id: "#TXN12342",
            customer: "Phạm Thị D",
            time: "09:45 25/04/2024",
            batteryType: "Eco-5kWh",
            status: "failed",
            cost: "0đ",
        },
        {
            id: "#TXN12341",
            customer: "Vũ Văn E",
            time: "08:22 25/04/2024",
            batteryType: "Pro-7kWh",
            status: "completed",
            cost: "50,000đ",
        },
    ];

    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: {
                label: "Hoàn thành",
                className: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",
            },
            processing: {
                label: "Đang xử lý",
                className: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300",
            },
            failed: {
                label: "Thất bại",
                className: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
            },
        };

        const config = statusConfig[status] || statusConfig.processing;
        return (
            <Badge className={`${config.className} px-2.5 py-1 text-xs font-semibold border-0`}>
                {config.label}
            </Badge>
        );
    };

    // Lọc giao dịch theo từ khóa tìm kiếm
    const filteredSwaps = recentSwaps.filter(
        (swap) =>
            swap.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            swap.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            swap.batteryType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    Tổng quan {stationData?.stationName || "Trạm"}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Theo dõi hoạt động và quản lý trạm đổi pin
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card
                        key={index}
                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300"
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {stat.title}
                                    </p>
                                    {stat.isStatus ? (
                                        <p className={`text-xl font-bold mt-2 flex items-center gap-2 ${stat.statusInfo.textColor}`}>
                                            <span className={`size-2.5 rounded-full ${stat.statusInfo.dotColor}`}></span>
                                            <span>{stat.value}</span>
                                        </p>
                                    ) : (
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                            {stat.value}
                                            {stat.total && (
                                                <span className="text-base font-medium text-slate-400">
                                                    /{stat.total}
                                                </span>
                                            )}
                                        </p>
                                    )}
                                </div>
                                <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Transactions Table */}
            <div>
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardContent className="p-6">
                        {/* Table Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Giao dịch gần đây
                            </h3>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-initial">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        type="text"
                                        placeholder="Tìm giao dịch..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 text-sm w-full sm:w-64 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <Button className="bg-primary hover:bg-primary-600 text-white">
                                    <FileText className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Xuất Báo Cáo</span>
                                </Button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900">
                                    <tr>
                                        <th className="px-6 py-3">Mã Giao Dịch</th>
                                        <th className="px-6 py-3">Khách hàng</th>
                                        <th className="px-6 py-3">Thời gian</th>
                                        <th className="px-6 py-3">Loại Pin</th>
                                        <th className="px-6 py-3 text-center">Trạng thái</th>
                                        <th className="px-6 py-3 text-right">Chi phí</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSwaps.length > 0 ? (
                                        filteredSwaps.map((swap) => (
                                            <tr
                                                key={swap.id}
                                                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                                            >
                                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                                                    {swap.id}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                                    {swap.customer}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                                    {swap.time}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                                    {swap.batteryType}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {getStatusBadge(swap.status)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">
                                                    {swap.cost}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
                                            >
                                                Không tìm thấy giao dịch nào
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
