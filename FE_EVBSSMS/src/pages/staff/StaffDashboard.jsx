import {
    Battery,
    RefreshCw,
    Power,
    AlertCircle,
    Search,
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
import { bookingApi } from "@/api"; // thêm bookingApi
import { formatDate } from "@/utils/format"; // dùng format thời gian
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

export default function StaffDashboard() {
    const { employeeId } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(0); // trang hiện tại cho bookings
    const pageSize = 10; // cố định kích thước trang

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

    // Tính toán Pin Sẵn Sàng từ danh sách batteries
    const batteries = stationData?.batteries || [];
    const readyBatteriesCount = batteries.filter((b) => b.status === "IN_USE").length;

    // Query bookings theo station để hiển thị bảng (phân trang)
    const {
        data: bookingsPage,
        isLoading: bookingsLoading,
        isError: bookingsError,
        refetch: refetchBookings
    } = useCustomQuery(
        ["station-bookings", stationData?.id, page, pageSize],
        () => bookingApi.getBookingsByStation(stationData.stationCode, page, pageSize),
        { enabled: !!stationData?.stationCode }
    );

    const bookings = bookingsPage?.content || [];
    const totalPages = bookingsPage?.totalPages || 0;
    const totalElements = bookingsPage?.totalElements || 0;

    // Query bookings trang đầu size lớn để đếm "Lượt đổi pin (Hôm nay)"
    const LARGE_SIZE = 200;
    const { data: bookingsTodayPage } = useCustomQuery(
        ["station-bookings-today", stationData?.stationCode],
        () => bookingApi.getBookingsByStation(stationData.stationCode, 0, LARGE_SIZE),
        { enabled: !!stationData?.id }
    );

    const bookingsTodayList = bookingsTodayPage?.content || [];
    const today = new Date();
    const todayCount = bookingsTodayList.filter((b) => {
        if (!b?.updatedAt) return false;
        const d = new Date(b.updatedAt);
        return (
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
        );
    }).length;

    // Badge trạng thái booking
    const getBookingStatusBadge = (status) => {
        const map = {
            PENDING: {
                label: "Chờ xử lý",
                className: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300",
            },
            CONFIRM: {
                label: "Đã xác nhận",
                className: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
            },
            SUCCESS: {
                label: "Hoàn thành",
                className: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",
            },
            CANCEL: {
                label: "Đã hủy",
                className: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
            },
            EXPIRED: {
                label: "Hết hạn",
                className: "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
            },
        };
        const cfg = map[status] || map.PENDING;
        return (
            <Badge className={`${cfg.className} px-2.5 py-1 text-xs font-semibold border-0`}>
                {cfg.label}
            </Badge>
        );
    };

    // Lọc bookings theo từ khóa tìm kiếm
    const filteredBookings = bookings.filter((b) => {
        const q = searchQuery.toLowerCase();
        if (!q) return true;
        return (
            String(b.id).toLowerCase().includes(q) ||
            b.driverId?.toLowerCase().includes(q) ||
            b.batteryModelId?.toLowerCase().includes(q) ||
            b.bookingStatus?.toLowerCase().includes(q)
        );
    });

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
            value: readyBatteriesCount,
            total: batteries.length || 0,
            icon: Battery,
            iconBg: "bg-primary-50 dark:bg-primary-900/50",
            iconColor: "text-primary dark:text-primary-300",
        },
        {
            title: "Lượt đổi pin (Hôm nay)",
            value: todayCount,
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
                                        placeholder="Tìm booking..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setPage(0);
                                        }}
                                        className="pl-10 pr-4 py-2 text-sm w-full sm:w-64 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => { refetchBookings(); toast.success("Đã làm mới danh sách"); }}
                                    className="bg-primary hover:bg-primary-600 text-white"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Làm mới
                                </Button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900">
                                    <tr>
                                        <th className="px-6 py-3">Mã Booking</th>
                                        <th className="px-6 py-3">Driver</th>
                                        <th className="px-6 py-3">Thời gian đặt</th>
                                        <th className="px-6 py-3">Loại Pin / Model</th>
                                        <th className="px-6 py-3 text-center">Trạng thái</th>
                                        <th className="px-6 py-3 text-right">Thanh toán</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookingsLoading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                                Đang tải dữ liệu...
                                            </td>
                                        </tr>
                                    ) : bookingsError ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-red-600 dark:text-red-400">
                                                Lỗi tải bookings
                                            </td>
                                        </tr>
                                    ) : filteredBookings.length > 0 ? (
                                        filteredBookings.map((b) => (
                                            <tr
                                                key={b.id}
                                                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                                            >
                                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                                                    #{b.id}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                                    {b.driverId || "-"}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                                    {formatDate(b.bookingTime)}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                                    {b.batteryModelId || b.paymentType || "-"}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {getBookingStatusBadge(b.bookingStatus)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">
                                                    {b.isPaid ? "Đã thanh toán" : "Chưa"}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                                Không tìm thấy booking nào
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                Tổng: {totalElements} | Trang {page + 1}/{totalPages || 1}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    disabled={page === 0 || bookingsLoading}
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                >
                                    Trước
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={page + 1 >= totalPages || bookingsLoading}
                                    onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
                                >
                                    Sau
                                </Button>
                                <Button
                                    variant="ghost"
                                    disabled={bookingsLoading}
                                    onClick={() => { setPage(0); refetchBookings(); }}
                                >
                                    Về trang 1
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
