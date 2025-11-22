import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { stationApi, batteriesApi } from "@/api";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { toast } from "react-hot-toast";
import {
    ArrowLeft,
    ArrowLeftRight,
    Battery,
    MapPin,
    Building2,
    Search,
    Zap,
    Gauge,
    AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BatteryDispatchPage() {
    const { stationId } = useParams();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBattery, setSelectedBattery] = useState(null);
    const [targetStation, setTargetStation] = useState(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    // Fetch tất cả stations
    const { data: stationsWrapper, isLoading } = useCustomQuery(
        ["all-stations"],
        () => stationApi.getAllStations()
    );

    // Chuẩn hoá danh sách trạm
    const allStations = useMemo(() => {
        const raw = stationsWrapper?.data || stationsWrapper || [];
        return Array.isArray(raw) ? raw : [];
    }, [stationsWrapper]);

    // Tìm trạm nguồn (trạm cần điều phối)
    const sourceStation = useMemo(() => {
        return allStations.find(s => s.id === parseInt(stationId));
    }, [allStations, stationId]);

    // Thống kê pin của trạm nguồn
    const sourceBatteryStats = useMemo(() => {
        const list = sourceStation?.batteries || [];
        const stats = {
            total: list.length,
            FULL: 0,
            CHARGING: 0,
            IN_USE: 0,
            DEFECTIVE: 0,
            MAINTENANCE: 0,
            IN_STOCK: 0,
            hold: 0,
        };
        list.forEach(b => {
            if (stats[b.status] !== undefined) {
                stats[b.status] += 1;
            } else {
                // Ghi nhận trạng thái phát sinh ngoài danh sách chuẩn
                stats[b.status] = (stats[b.status] || 0) + 1;
            }
            if (b.hold) stats.hold += 1;
        });
        return stats;
    }, [sourceStation]);

    // Lọc pin có thể điều phối từ các trạm khác (không phải trạm nguồn)
    const availableStationsWithBatteries = useMemo(() => {
        return allStations
            .filter(station => station.id !== parseInt(stationId))
            .map(station => {
                // Lọc pin theo điều kiện: status = IN_USE, soc = 100, soh = 100, hold = false, ownerType = STATION
                const availableBatteries = (station.batteries || []).filter(battery =>
                    battery.status === "IN_USE" &&
                    battery.soc === 100 &&
                    battery.soh === 100 &&
                    battery.hold === false &&
                    battery.ownerType === "STATION"
                );

                return {
                    ...station,
                    availableBatteries,
                    batteryCount: availableBatteries.length,
                };
            })
            .filter(station => station.batteryCount > 0); // Chỉ hiển thị trạm có pin
    }, [allStations, stationId]);

    // Tìm kiếm trạm
    const filteredStations = useMemo(() => {
        if (!searchQuery) return availableStationsWithBatteries;
        const query = searchQuery.toLowerCase();
        return availableStationsWithBatteries.filter(station =>
            station.stationName?.toLowerCase().includes(query) ||
            station.stationCode?.toLowerCase().includes(query) ||
            station.address?.toLowerCase().includes(query)
        );
    }, [availableStationsWithBatteries, searchQuery]);

    // Mutation điều phối pin
    const swapMutation = useCustomMutation(
        (data) => batteriesApi.swapStationToStation(data),
        "POST",
        {
            invalidateKeys: ["all-stations"], // Tự động refetch danh sách trạm sau khi thành công
            onSuccess: () => {
                toast.success("Điều phối pin thành công!");
                setIsConfirmDialogOpen(false);
                setSelectedBattery(null);
                setTargetStation(null);
                // Giữ nguyên trang hiện tại (không navigate)
            },
            onError: () => {
                toast.error("Điều phối pin thất bại. Vui lòng thử lại.");
            },
        }
    );

    const handleDispatchBattery = (battery, station) => {
        setSelectedBattery(battery);
        setTargetStation(station);
        setIsConfirmDialogOpen(true);
    };

    const confirmDispatch = () => {
        if (!selectedBattery || !targetStation || !sourceStation) {
            toast.error("Thiếu thông tin để điều phối!");
            return;
        }

        const payload = {
            oldstationId: targetStation.stationCode.toString(),
            newstationId: sourceStation.stationCode.toString(),
            swapStatus: "SUCCESS",
            batteryId: selectedBattery.batteryCode.toString(),
        };

        swapMutation.mutate(payload);
    };

    const getBatteryStatusBadge = (status) => {
        const statusMap = {
            FULL: { label: "Đầy", className: "bg-green-500 text-white" },
            CHARGING: { label: "Đang sạc", className: "bg-blue-500 text-white" },
            IN_USE: { label: "Đang dùng", className: "bg-purple-500 text-white" },
            DEFECTIVE: { label: "Hỏng", className: "bg-red-500 text-white" },
            MAINTENANCE: { label: "Bảo trì", className: "bg-yellow-500 text-white" },
            IN_STOCK: { label: "Trong kho", className: "bg-gray-500 text-white" },
        };
        return statusMap[status] || { label: status, className: "bg-gray-500 text-white" };
    };

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    if (!sourceStation) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-500">Không tìm thấy thông tin trạm</p>
                        <Button
                            onClick={() => navigate("/admin/stations")}
                            className="mt-4 bg-[#135bec] hover:bg-[#135bec]/90 cursor-pointer"
                        >
                            Quay lại
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-white text-gray-900">
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/admin/stations")}
                            className="mb-4 gap-2 cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại
                        </Button>

                        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
                            <span className="text-[#135bec]">Điều phối pin</span>
                        </h1>
                        <p className="text-lg text-gray-600">
                            Điều phối pin cho trạm: <span className="font-semibold text-gray-800">{sourceStation.stationName}</span>
                        </p>
                    </div>

                    {/* Source Station Info */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[#135bec]" />
                                Thông tin trạm cần điều phối
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Mã trạm</p>
                                    <p className="text-base font-semibold">{sourceStation.stationCode}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Địa chỉ</p>
                                    <p className="text-base font-semibold">{sourceStation.address}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Số điện thoại</p>
                                    <p className="text-base font-semibold">{sourceStation.phoneNumber}</p>
                                </div>
                            </div>

                            {/* Thống kê bổ sung */}
                            <div className="mt-6 space-y-6">
                                {/* Slots */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                                        <p className="text-xs uppercase tracking-wide text-gray-500">Tổng số pin</p>
                                        <p className="text-xl font-bold text-gray-800">{sourceBatteryStats.total}</p>
                                    </div>
                                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                                        <p className="text-xs uppercase tracking-wide text-gray-500">Pin đang hold</p>
                                        <p className="text-xl font-bold text-gray-800">{sourceBatteryStats.hold}</p>
                                    </div>
                                </div>

                                {/* Trạng thái pin */}
                                <div>
                                    <p className="text-sm font-semibold mb-3 text-gray-700">Phân bố trạng thái pin</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                        {[
                                            "FULL",
                                            "CHARGING",
                                            "IN_USE",
                                            "DEFECTIVE",
                                            "MAINTENANCE",
                                            "IN_STOCK",
                                        ].map(status => (
                                            <div key={status} className="p-3 rounded-md border border-gray-200 bg-white flex flex-col gap-2">
                                                <Badge className={getBatteryStatusBadge(status).className + " w-fit"}>
                                                    {getBatteryStatusBadge(status).label}
                                                </Badge>
                                                <p className="text-sm font-medium text-gray-800">{sourceBatteryStats[status] || 0}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Trạng thái khác nếu phát sinh */}
                                {(() => {
                                    const known = new Set(["FULL","CHARGING","IN_USE","DEFECTIVE","MAINTENANCE","IN_STOCK","total","hold"]);
                                    const extraStatuses = Object.keys(sourceBatteryStats).filter(k => !known.has(k));
                                    if (extraStatuses.length === 0) return null;
                                    return (
                                        <div>
                                            <p className="text-sm font-semibold mb-3 text-gray-700">Trạng thái bổ sung</p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                                {extraStatuses.map(st => (
                                                    <div key={st} className="p-3 rounded-md border border-gray-200 bg-white flex flex-col gap-2">
                                                        <Badge className="bg-gray-500 text-white w-fit">{st}</Badge>
                                                        <p className="text-sm font-medium text-gray-800">{sourceBatteryStats[st]}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Danh sách chi tiết pin của trạm nguồn */}
                                <div>
                                    <p className="text-sm font-semibold mb-3 text-gray-700">Danh sách chi tiết pin tại trạm</p>
                                    {sourceStation.batteries?.length ? (
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="grid grid-cols-5 bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                <div className="p-2">Mã pin</div>
                                                <div className="p-2">Model</div>
                                                <div className="p-2">Dung lượng</div>
                                                <div className="p-2">SOC / Trạng thái</div>
                                                <div className="p-2">Hold</div>
                                            </div>
                                            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                                                {sourceStation.batteries.map(b => (
                                                    <div key={b.id} className="grid grid-cols-5 text-sm text-gray-700 hover:bg-gray-50 transition">
                                                        <div className="p-2 font-medium flex items-center gap-2">
                                                            <Battery className="w-4 h-4 text-green-600" /> {b.batteryCode}
                                                        </div>
                                                        <div className="p-2 flex items-center">{b.model || "-"}</div>
                                                        <div className="p-2 flex items-center">{b.capacity ? `${b.capacity}kWh` : "-"}</div>
                                                        <div className="p-2 flex flex-col md:flex-row md:items-center md:gap-2">
                                                            <span>{b.soc != null ? `${b.soc}%` : "-"}</span>
                                                            <Badge className={getBatteryStatusBadge(b.status).className + " w-fit mt-1 md:mt-0"}>{getBatteryStatusBadge(b.status).label}</Badge>
                                                        </div>
                                                        <div className="p-2 flex items-center">
                                                            {b.hold ? (
                                                                <Badge className="bg-red-500 text-white">Giữ</Badge>
                                                            ) : (
                                                                <Badge className="bg-green-500 text-white">Tự do</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Không có pin nào tại trạm.</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Search */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm trạm theo tên, mã hoặc địa chỉ..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 cursor-text"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stations List */}
                    {filteredStations.length === 0 ? (
                        <Card>
                            <CardContent className="pt-12 pb-12 text-center">
                                <Battery className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    {searchQuery
                                        ? "Không tìm thấy trạm nào phù hợp"
                                        : "Không có trạm nào có pin khả dụng để điều phối"}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {filteredStations.map((station) => (
                                <Card key={station.id} className="hover:shadow-lg transition-all">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-2xl mb-1 flex items-center gap-2">
                                                    <MapPin className="w-6 h-6 text-[#135bec]" />
                                                    {station.stationName}
                                                </CardTitle>
                                                <p className="text-sm text-gray-500">{station.address}</p>
                                            </div>
                                            <Badge className="bg-[#135bec] text-white">
                                                {station.batteryCount} pin khả dụng
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {station.availableBatteries.map((battery) => (
                                                <div
                                                    key={battery.id}
                                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                                >
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                                            <Battery className="w-6 h-6 text-green-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-semibold text-gray-900">
                                                                    {battery.batteryCode}
                                                                </p>
                                                                <Badge className={getBatteryStatusBadge(battery.status).className}>
                                                                    {getBatteryStatusBadge(battery.status).label}
                                                                </Badge>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                                                                <div className="flex items-center gap-1">
                                                                    <Gauge className="w-4 h-4 text-blue-500" />
                                                                    <span>Model: {battery.model}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Zap className="w-4 h-4 text-yellow-500" />
                                                                    <span>SOC: {battery.soc}%</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Gauge className="w-4 h-4 text-green-500" />
                                                                    <span>SOH: {battery.soh}%</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleDispatchBattery(battery, station)}
                                                        className="bg-green-600 hover:bg-green-700 cursor-pointer gap-2"
                                                    >
                                                        <ArrowLeftRight className="w-4 h-4" />
                                                        Điều phối
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Dialog */}
            <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận điều phối pin</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn điều phối pin <strong>{selectedBattery?.batteryCode}</strong>
                            <br />
                            Từ trạm: <strong>{targetStation?.stationName}</strong>
                            <br />
                            Đến trạm: <strong>{sourceStation?.stationName}</strong>
                            <br />
                            <span className="text-blue-600 font-medium mt-2 inline-block">
                                Pin sẽ được chuyển sang trạm đích.
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setSelectedBattery(null);
                            setTargetStation(null);
                        }}>
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDispatch}
                            disabled={swapMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 cursor-pointer"
                        >
                            {swapMutation.isPending ? "Đang điều phối..." : "Xác nhận điều phối"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
