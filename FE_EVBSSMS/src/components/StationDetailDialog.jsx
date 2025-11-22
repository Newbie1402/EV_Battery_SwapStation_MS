import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    // DialogFooter, // removed unused
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { adminApi } from "@/api/adminApi";
import { getBatteryByCode } from "@/api/batteriesApi";
import { stationApi } from "@/api/stationApi";
import { Trash2, User as UserIcon, ArrowLeftRight } from "lucide-react";

export default function StationDetailDialog({ isOpen, onClose, station, onStaffRemoved }) {
    const navigate = useNavigate();
    const [staffDetails, setStaffDetails] = useState([]);
    const [batteryDetails, setBatteryDetails] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [loadingBatteries, setLoadingBatteries] = useState(false);
    const [removingStaffCode, setRemovingStaffCode] = useState(null);
    const [isDeleteStaffDialogOpen, setIsDeleteStaffDialogOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);

    const getStatusBadge = (status) => {
        switch (status) {
            case "ACTIVE":
                return { label: "Hoạt động", className: "bg-green-500" };
            case "OFFLINE":
                return { label: "Tạm đóng", className: "bg-red-500" };
            case "MAINTENANCE":
                return { label: "Bảo trì", className: "bg-yellow-500" };
            default:
                return { label: "Không xác định", className: "bg-gray-500" };
        }
    };

    const getBatteryStatusToken = (battery) => {
        const status = battery?.status || battery?.data?.status || "";
        const soc = battery?.soc ?? battery?.data?.soc ?? battery?.data?.data?.soc;
        return { status, soc };
    };

    const getBatterySocBadge = (soc, status) => {
        if (soc == null) {
            return { className: "bg-gray-100 text-gray-700", label: status || "N/A" };
        }
        if (soc >= 80) return { className: "bg-green-100 text-green-800", label: `${soc}%` };
        if (soc >= 50) return { className: "bg-blue-100 text-blue-800", label: `${soc}%` };
        if (soc >= 20) return { className: "bg-yellow-100 text-yellow-800", label: `${soc}%` };
        return { className: "bg-red-100 text-red-800", label: `${soc}%` };
    };

    // Fetch staff details
    useEffect(() => {
        if (!isOpen || !station?.staffCode || station.staffCode.length === 0) {
            setStaffDetails([]);
            return;
        }
        let isMounted = true;
        const fetchStaff = async () => {
            setLoadingStaff(true);
            try {
                const results = await Promise.all(
                    station.staffCode.map(async (code) => {
                        try {
                            const res = await adminApi.getStaffById(code);
                            return { code, data: res?.data || res };
                        } catch {
                            return { code, data: null, error: true };
                        }
                    })
                );
                if (isMounted) setStaffDetails(results);
            } catch {
                toast.error("Không thể tải thông tin nhân viên");
            } finally {
                if (isMounted) setLoadingStaff(false);
            }
        };
        fetchStaff();
        return () => { isMounted = false; };
    }, [isOpen, station?.staffCode]);

    // Fetch battery details
    useEffect(() => {
        if (!isOpen || !station?.batteries || station.batteries.length === 0) {
            setBatteryDetails([]);
            return;
        }
        let isMounted = true;
        const fetchBatteries = async () => {
            setLoadingBatteries(true);
            try {
                const results = await Promise.all(
                    station.batteries.map(async (battery) => {
                        const code = battery?.batteryCode || battery?.code || battery?.data?.batteryCode || "";
                        if (!code) return { code: "", data: null };
                        try {
                            const res = await getBatteryByCode(code);
                            return { code, data: res?.data || res };
                        } catch {
                            return { code, data: null, error: true };
                        }
                    })
                );
                if (isMounted) setBatteryDetails(results);
            } catch {
                toast.error("Không thể tải thông tin pin");
            } finally {
                if (isMounted) setLoadingBatteries(false);
            }
        };
        fetchBatteries();
        return () => { isMounted = false; };
    }, [isOpen, station?.batteries]);

    const handleRemoveStaff = useCallback(async (code) => {
        if (!station?.id) {
            toast.error("Thiếu ID trạm để xóa nhân viên");
            return;
        }
        setRemovingStaffCode(code);
        try {
            await stationApi.removeStaffFromStation(station.id, code);
            toast.success("Đã xóa nhân viên khỏi trạm");
            setStaffDetails((prev) => prev.filter((s) => s.code !== code));
            if (onStaffRemoved) onStaffRemoved(code);
        } catch {
            toast.error("Xóa nhân viên thất bại");
        } finally {
            setRemovingStaffCode(null);
            setIsDeleteStaffDialogOpen(false);
            setStaffToDelete(null);
        }
    }, [station?.id, onStaffRemoved]);

    const openDeleteStaffDialog = useCallback((staff) => {
        setStaffToDelete(staff);
        setIsDeleteStaffDialogOpen(true);
    }, []);

    const confirmDeleteStaff = useCallback(() => {
        if (staffToDelete) {
            handleRemoveStaff(staffToDelete.code);
        }
    }, [staffToDelete, handleRemoveStaff]);

    const summaryCounts = useMemo(() => ({
        batteries: batteryDetails.length,
        staff: staffDetails.length,
    }), [batteryDetails.length, staffDetails.length]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-6xl p-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-background-dark">
                    <DialogHeader className="p-0 m-0">
                        <DialogTitle className="text-xl font-bold">Thông tin chi tiết Trạm</DialogTitle>
                        <DialogDescription className="sr-only">Chi tiết cấu hình và tình trạng trạm</DialogDescription>
                    </DialogHeader>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <Trash2 className="hidden" />
                        <span className="sr-only">Đóng</span>
                        ×
                    </Button>
                </div>

                {station ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-h-[70vh] overflow-y-auto bg-white dark:bg-background-dark">
                        {/* Cột thông tin chung */}
                        <div className="flex flex-col gap-5">
                            <h3 className="text-lg font-bold">Thông tin chung</h3>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                                <InfoItem label="Tên trạm" value={station.stationName} />
                                <InfoItem label="Mã trạm" value={station.stationCode || "N/A"} />
                                <InfoItem label="Địa chỉ" value={station.address} className="sm:col-span-2" />
                                <InfoItem label="Số điện thoại" value={station.phoneNumber || "Chưa có"} />
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Trạng thái</p>
                                    <div className="flex items-center">
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white ${getStatusBadge(station.status).className}`}>
                                            <span className="mr-1.5 h-2 w-2 rounded-full bg-white/90"></span>
                                            {getStatusBadge(station.status).label}
                                        </span>
                                    </div>
                                </div>
                                <InfoItem label="Tổng slots" value={station.totalSlots || 0} />
                                <InfoItem label="Slots khả dụng" value={station.availableSlots || 0} />
                                <InfoItem label="Số lượng pin" value={summaryCounts.batteries} />
                                <InfoItem label="Số lượng nhân viên" value={summaryCounts.staff} />
                            </div>
                        </div>

                        {/* Cột danh sách chi tiết */}
                        <div className="flex flex-col gap-6">
                            {/* Pin */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-lg font-bold">Danh sách pin tại trạm</h3>
                                <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark">
                                    {loadingBatteries ? (
                                        <div className="p-4 grid grid-cols-2 gap-3">
                                            {Array.from({ length: 4 }).map((_, i) => (
                                                <Skeleton key={i} className="h-14 w-full" />
                                            ))}
                                        </div>
                                    ) : batteryDetails.length === 0 ? (
                                        <p className="p-4 text-sm text-gray-500">Chưa có pin</p>
                                    ) : (
                                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {batteryDetails.map((battery) => {
                                                const { status, soc } = getBatteryStatusToken(battery.data);
                                                const badge = getBatterySocBadge(soc, status);
                                                return (
                                                    <div key={battery.code} className="flex items-center justify-between p-4">
                                                        <div>
                                                            <p className="text-sm font-semibold">Mã pin: {battery.code}</p>
                                                            <p className="text-xs text-gray-500">{status || "Không rõ"}</p>
                                                        </div>
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Nhân viên */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-lg font-bold">Nhân viên tại trạm</h3>
                                <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark">
                                    {loadingStaff ? (
                                        <div className="p-4 grid grid-cols-2 gap-3">
                                            {Array.from({ length: 4 }).map((_, i) => (
                                                <Skeleton key={i} className="h-14 w-full" />
                                            ))}
                                        </div>
                                    ) : staffDetails.length === 0 ? (
                                        <p className="p-4 text-sm text-gray-500">Chưa có nhân viên</p>
                                    ) : (
                                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {staffDetails.map((staff) => (
                                                <div key={staff.code} className="flex items-center justify-between p-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                                            <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold">{staff.data?.fullName || staff.data?.name || "Không rõ"}</p>
                                                            <p className="text-xs text-gray-500">Mã: {staff.code}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-600 hover:text-red-700"
                                                        disabled={removingStaffCode === staff.code}
                                                        onClick={() => openDeleteStaffDialog(staff)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span className="sr-only">Xóa</span>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6"><Skeleton className="h-40 w-full" /></div>
                )}

                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-background-dark">
                    <Button
                        onClick={() => {
                            navigate(`/admin/stations/${station.id}/battery-dispatch`);
                            onClose();
                        }}
                        className="bg-green-600 hover:bg-green-700 cursor-pointer gap-2"
                    >
                        <ArrowLeftRight className="w-4 h-4" />
                        Điều phối pin
                    </Button>
                    <Button onClick={onClose} className="bg-[#135bec] hover:bg-[#135bec]/90 cursor-pointer">Đóng</Button>
                </div>
            </DialogContent>

            {/* Alert Dialog xác nhận xóa nhân viên */}
            <AlertDialog open={isDeleteStaffDialogOpen} onOpenChange={setIsDeleteStaffDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa nhân viên</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa nhân viên{" "}
                            <strong>{staffToDelete?.data?.fullName || staffToDelete?.data?.name || staffToDelete?.code}</strong>{" "}
                            khỏi trạm <strong>{station?.stationName}</strong> không?
                            <br />
                            <span className="text-red-600 font-medium mt-2 inline-block">
                                Hành động này không thể hoàn tác!
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setStaffToDelete(null)}>
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteStaff}
                            disabled={removingStaffCode === staffToDelete?.code}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {removingStaffCode === staffToDelete?.code ? "Đang xóa..." : "Xóa nhân viên"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
}

function InfoItem({ label, value, className = "" }) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-base font-semibold text-gray-800 dark:text-gray-100 break-words">{value}</p>
        </div>
    );
}
