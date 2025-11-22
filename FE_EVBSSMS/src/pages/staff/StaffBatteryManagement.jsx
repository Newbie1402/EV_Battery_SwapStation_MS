import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { stationApi } from "@/api/stationApi";
import useCustomQuery from "@/hooks/useCustomQuery";
import { toast } from "react-hot-toast";
import {
    Battery,
    Search,
    Filter,
    RefreshCw,
    AlertCircle,
    Zap,
    TrendingUp,
    Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export default function StaffBatteryManagement() {
    const { employeeId } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [stationCode, setStationCode] = useState(() => localStorage.getItem("staffStationCode"));
    const [stationName, setStationName] = useState(() => localStorage.getItem("staffStationName"));

    // Lắng nghe thay đổi localStorage (ví dụ user vào Dashboard tab khác rồi quay lại)
    useEffect(() => {
        const syncFromStorage = () => {
            const code = localStorage.getItem("staffStationCode");
            const name = localStorage.getItem("staffStationName");
            if (code && code !== stationCode) setStationCode(code);
            if (name && name !== stationName) setStationName(name);
        };
        syncFromStorage();
        window.addEventListener("storage", syncFromStorage);
        return () => window.removeEventListener("storage", syncFromStorage);
    }, [stationCode, stationName]);

    // Query danh sách pin (hook luôn nằm trước mọi return để tránh lỗi hooks conditionally)
    const {
        data: batteries,
        isLoading: isLoadingBatteries,
        refetch: refetchBatteries,
    } = useCustomQuery(
        ["station-batteries", stationCode],
        () => stationApi.getBatteriesByStationCode(stationCode),
        {
            enabled: !!stationCode,
            onError: () => toast.error("Không thể tải danh sách pin"),
        }
    );

    // Early returns (sau hook)
    if (!employeeId) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Không xác định được mã nhân viên. Vui lòng đăng nhập lại.
                </AlertDescription>
            </Alert>
        );
    }

    if (!stationCode) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Chưa có dữ liệu mã trạm. Vui lòng truy cập trang Tổng quan để tải thông tin trạm.
                </AlertDescription>
            </Alert>
        );
    }

    // Chuẩn hóa dữ liệu pin
    const batteriesData = Array.isArray(batteries) ? batteries : batteries?.data || [];

    // Lọc pin theo tìm kiếm & trạng thái
    const filteredBatteries = batteriesData.filter((battery) => {
        const matchSearch = searchQuery
            ? battery.batteryCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              battery.model?.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        const matchStatus = statusFilter === "ALL" ? true : battery.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Thống kê pin
    const batteryStats = {
        total: batteriesData.length,
        full: batteriesData.filter((b) => b.status === "FULL").length,
        charging: batteriesData.filter((b) => b.status === "CHARGING").length,
        inUse: batteriesData.filter((b) => b.status === "IN_USE").length,
        defective: batteriesData.filter((b) => b.status === "DEFECTIVE").length,
        maintenance: batteriesData.filter((b) => b.status === "MAINTENANCE").length,
        avgSoc: batteriesData.length > 0
            ? (batteriesData.reduce((sum, b) => sum + (b.soc || 0), 0) / batteriesData.length).toFixed(1)
            : 0,
        avgSoh: batteriesData.length > 0
            ? (batteriesData.reduce((sum, b) => sum + (b.soh || 0), 0) / batteriesData.length).toFixed(1)
            : 0,
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            FULL: { label: "Đầy", className: "bg-green-500 text-white" },
            CHARGING: { label: "Đang sạc", className: "bg-blue-500 text-white" },
            IN_USE: { label: "Đang dùng", className: "bg-yellow-500 text-white" },
            DEFECTIVE: { label: "Hỏng", className: "bg-red-500 text-white" },
            MAINTENANCE: { label: "Bảo trì", className: "bg-orange-500 text-white" },
            IN_STOCK: { label: "Trong kho", className: "bg-gray-500 text-white" },
        };
        return statusMap[status] || { label: "Không rõ", className: "bg-gray-400 text-white" };
    };

    const getSocColor = (soc) => {
        if (soc >= 80) return "text-green-600";
        if (soc >= 50) return "text-blue-600";
        if (soc >= 20) return "text-yellow-600";
        return "text-red-600";
    };

    const getSohColor = (soh) => {
        if (soh >= 90) return "text-green-600";
        if (soh >= 70) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        Quản lý Pin - {stationName || stationCode}
                    </h1>
                    <p className="text-slate-600 mt-1">Theo dõi và quản lý tình trạng pin tại trạm</p>
                </div>
                <Button onClick={() => refetchBatteries()} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    {isLoadingBatteries ? "Đang tải..." : "Làm mới"}
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">Tổng số pin</p><p className="text-3xl font-bold text-slate-900 mt-1">{batteryStats.total}</p></div><div className="p-2.5 rounded-lg bg-blue-100"><Battery className="h-6 w-6 text-blue-600" /></div></div></CardContent></Card>
                <Card><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">Pin sẵn sàng</p><p className="text-3xl font-bold text-green-600 mt-1">{batteryStats.full}</p></div><div className="p-2.5 rounded-lg bg-green-100"><Zap className="h-6 w-6 text-green-600" /></div></div></CardContent></Card>
                <Card><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">SOC trung bình</p><p className="text-3xl font-bold text-blue-600 mt-1">{batteryStats.avgSoc}%</p></div><div className="p-2.5 rounded-lg bg-blue-100"><TrendingUp className="h-6 w-6 text-blue-600" /></div></div></CardContent></Card>
                <Card><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">SOH trung bình</p><p className="text-3xl font-bold text-green-600 mt-1">{batteryStats.avgSoh}%</p></div><div className="p-2.5 rounded-lg bg-green-100"><Activity className="h-6 w-6 text-green-600" /></div></div></CardContent></Card>
            </div>

            {/* Filters & Search */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm theo mã pin, model..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                <SelectItem value="FULL">Đầy</SelectItem>
                                <SelectItem value="CHARGING">Đang sạc</SelectItem>
                                <SelectItem value="IN_USE">Đang dùng</SelectItem>
                                <SelectItem value="DEFECTIVE">Hỏng</SelectItem>
                                <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                                <SelectItem value="IN_STOCK">Trong kho</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Battery List */}
            {isLoadingBatteries ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
                </div>
            ) : filteredBatteries.length === 0 ? (
                <Card><CardContent className="py-12 text-center"><Battery className="w-12 h-12 text-slate-400 mx-auto mb-4" /><p className="text-slate-500">Không tìm thấy pin nào</p></CardContent></Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBatteries.map((battery) => {
                        const statusInfo = getStatusBadge(battery.status);
                        return (
                            <Card key={battery.id || battery.batteryCode} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-semibold">{battery.batteryCode}</CardTitle>
                                            <p className="text-sm text-slate-500 mt-1">{battery.model}</p>
                                        </div>
                                        <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><p className="text-slate-500">Dung lượng</p><p className="font-semibold text-slate-900">{battery.capacity} kWh</p></div>
                                        <div><p className="text-slate-500">Loại</p><p className="font-semibold text-slate-900">{battery.ownerType === "STATION" ? "Trạm" : "Xe"}</p></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm"><span className="text-slate-500">SOC</span><span className={`font-semibold ${getSocColor(battery.soc)}`}>{battery.soc}%</span></div>
                                        <Progress value={battery.soc} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm"><span className="text-slate-500">SOH</span><span className={`font-semibold ${getSohColor(battery.soh)}`}>{battery.soh}%</span></div>
                                        <Progress value={battery.soh} className="h-2" />
                                    </div>
                                    {battery.referenceId && <div className="pt-2 border-t"><p className="text-xs text-slate-500">Reference ID: {battery.referenceId}</p></div>}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Battery Status Summary */}
            <Card>
                <CardHeader><CardTitle>Tổng quan trạng thái pin</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <SummaryItem label="Đầy" value={batteryStats.full} className="text-green-600" />
                        <SummaryItem label="Đang sạc" value={batteryStats.charging} className="text-blue-600" />
                        <SummaryItem label="Đang dùng" value={batteryStats.inUse} className="text-yellow-600" />
                        <SummaryItem label="Hỏng" value={batteryStats.defective} className="text-red-600" />
                        <SummaryItem label="Bảo trì" value={batteryStats.maintenance} className="text-orange-600" />
                        <SummaryItem label="Tổng cộng" value={batteryStats.total} className="text-slate-600" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function SummaryItem({ label, value, className }) {
    return (
        <div className="text-center">
            <p className={`text-2xl font-bold ${className}`}>{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
        </div>
    );
}
