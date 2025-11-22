import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import {stationApi, bookingApi, batteriesApi, paymentApi, subscriptionPackageApi} from "@/api";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { toast } from "react-hot-toast";
import {
    Calendar,
    Search,
    Filter,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    Battery,
    FileText,
    BadgeCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Import các dialog components
import BookingConfirmDialog from "@/components/BookingConfirmDialog";
import PaymentSwapDialog from "@/components/PaymentSwapDialog.jsx";
import SwapLogDialog from "@/components/SwapLogDialog";
import BookingDetailDialog from "@/components/BookingDetailDialog";

export default function StaffBookingManagementPage() {
    const { employeeId } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [stationCode, setStationCode] = useState(() => localStorage.getItem("staffStationCode"));
    const [stationId, setStationId] = useState(() => localStorage.getItem("staffStationId"));

    // Dialog states
    const [confirmDialog, setConfirmDialog] = useState({ open: false, booking: null, battery: null });
    const [paymentDialog, setPaymentDialog] = useState({ open: false, booking: null, battery: null });
    const [swapDialog, setSwapDialog] = useState({ open: false, booking: null, battery: null });
    const [detailDialog, setDetailDialog] = useState({ open: false, booking: null });

    // Subscription state
    const [subscriptionInfo, setSubscriptionInfo] = useState(null);

    // Lắng nghe localStorage
    useEffect(() => {
        const syncFromStorage = () => {
            const code = localStorage.getItem("staffStationCode");
            const id = localStorage.getItem("staffStationId");
            if (id && id !== stationId) setStationId(stationId);
            if (code && code !== stationCode) setStationCode(code);
        };
        syncFromStorage();
        window.addEventListener("storage", syncFromStorage);
        return () => window.removeEventListener("storage", syncFromStorage);
    }, [stationCode, stationId]);

    // Lấy thông tin trạm để có stationId
    useCustomQuery(
        ["staff-station", employeeId],
        () => stationApi.getStationByStaffCode(employeeId),
        {
            enabled: !!employeeId,
            onSuccess: (data) => {
                const stationData = data;
                if (stationData?.id) {
                    setStationId(stationData.id);
                }
            },
        }
    );

    // Lấy danh sách booking theo stationCode
    const {
        data: bookings,
        isLoading: isLoadingBookings,
        refetch: refetchBookings,
    } = useCustomQuery(
        ["station-bookings", stationCode],
        () => bookingApi.getBookingsByStation(stationCode),
        {
            enabled: !!stationCode,
            onError: () => toast.error("Không thể tải danh sách booking"),
        }
    );

    // Mutation: Hold battery
    const holdBatteryMutation = useCustomMutation(
        (batteryCode) => batteriesApi.holdBattery(batteryCode),
        undefined,
        {
            onSuccess: () => {
                console.log("Pin đã được giữ (hold) thành công");
            },
        }
    );

    // Mutation: Confirm booking
    const confirmBookingMutation = useCustomMutation(
        (id) => bookingApi.confirmBooking(id),
        undefined,
        {
            onSuccess: async () => {
                toast.success("Đã xác nhận booking thành công!");

                // Gọi holdBattery để đánh dấu pin đang được giữ
                const currentBooking = confirmDialog.booking;
                if (currentBooking?.batteryModelId) {
                    try {
                        await holdBatteryMutation.mutateAsync(currentBooking.batteryModelId);
                    } catch {
                        console.error("Lỗi khi hold battery");
                        // Vẫn tiếp tục dù hold battery thất bại
                    }
                }

                refetchBookings();
                setConfirmDialog({ open: false, booking: null, battery: null });
            },
        }
    );

    // Mutation: Cancel booking
    const cancelBookingMutation = useCustomMutation(
        ({ id, reason }) =>
            bookingApi.cancelBooking(id, {
                cancelReason: reason,
                cancelledBy: employeeId,
            }),
        undefined,
        {
            onSuccess: () => {
                toast.success("Đã hủy booking!");
                refetchBookings();
                setConfirmDialog({ open: false, booking: null, battery: null });
            },
        }
    );

    // Mutation: Create payment
    const createPaymentMutation = useCustomMutation(
        (data) => paymentApi.createSwapPackage(data),
        undefined,
        {
            onSuccess: () => {
                toast.success("Đã tạo hóa đơn thanh toán!");
            },
        }
    );

    // Mutation: Update booking with paymentId
    const updateBookingMutation = useCustomMutation(
        ({ id, data }) => bookingApi.updateBooking(id, data),
        undefined,
        {
            onSuccess: () => {
                toast.success("Đã cập nhật thông tin booking!");
                refetchBookings();
                setPaymentDialog({ open: false, booking: null, battery: null });
            },
        }
    );

    // Mutation: Confirm cash payment
    const confirmCashPaymentMutation = useCustomMutation(
        (paymentId) => paymentApi.confirmCashPayment(paymentId),
        "POST",
        {
            onSuccess: () => {
                toast.success("Đã xác nhận thanh toán tiền mặt!");
            },
        }
    );

    // Mutation: Confirm booking payment (chuyển isPaid = true)
    const confirmBookingPaymentMutation = useCustomMutation(
        (bookingId) => bookingApi.confirmBookingPayment(bookingId),
        "POST",
        {
            onSuccess: () => {
                toast.success("Booking đã được đánh dấu đã thanh toán!");
                refetchBookings(); // Refetch để cập nhật UI ngay lập tức
            },
        }
    );

    // Mutation: Swap battery
    const swapBatteryMutation = useCustomMutation(
        (data) => batteriesApi.swapStationToVehicle(data),
        undefined,
        {
            onSuccess: () => {
                toast.success("Đã ghi log đổi pin!");
            },
        }
    );

    // Mutation: Update battery
    const updateBatteryMutation = useCustomMutation(
        ({ batteryCode, data }) => batteriesApi.updateHealthBattery(batteryCode, data),
        undefined,
        {
            onSuccess: () => {
                toast.success("Đã cập nhật thông tin pin cũ!");
            },
        }
    );

    // Mutation: Complete booking
    const completeBookingMutation = useCustomMutation(
        ({ id, paymentId }) => bookingApi.completeBooking(Number(id), Number(paymentId)),
        undefined,
        {
            onSuccess: () => {
                toast.success("Đã hoàn tất booking!");
                refetchBookings();
                setSwapDialog({ open: false, booking: null, battery: null });
            },
        }
    );

    // Early returns
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

    const bookingsData = bookings?.content || bookings || [];

    // Lọc bookings
    const filteredBookings = bookingsData.filter((booking) => {
        const matchSearch = searchQuery
            ? booking.id?.toString().includes(searchQuery) ||
              booking.driverId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              booking.batteryModelId?.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        const matchStatus = statusFilter === "ALL" ? true : booking.bookingStatus === statusFilter;
        return matchSearch && matchStatus;
    });

    // Thống kê
    const stats = {
        total: bookingsData.length,
        pending: bookingsData.filter((b) => b.bookingStatus === "PENDING").length,
        confirm: bookingsData.filter((b) => b.bookingStatus === "CONFIRM").length,
        complete: bookingsData.filter((b) => b.bookingStatus === "COMPLETE").length,
        cancel: bookingsData.filter((b) => b.bookingStatus === "CANCEL").length,
    };

    // Handler: Mở dialog xác nhận/hủy
    const handleOpenConfirmDialog = async (booking) => {
        try {
            const batteryResponse = await batteriesApi.getBatteryByCode(booking.batteryModelId);
            const batteryData = batteryResponse?.data || batteryResponse;
            setConfirmDialog({ open: true, booking, battery: batteryData });
        } catch {
            toast.error("Không thể tải thông tin pin");
        }
    };

    // Handler: Xác nhận booking
    const handleConfirmBooking = (id) => {
        confirmBookingMutation.mutate(id);
    };

    // Handler: Hủy booking
    const handleCancelBooking = (id, reason) => {
        cancelBookingMutation.mutate({ id, reason });
    };

    // Handler: Mở dialog thanh toán
    const handleOpenPaymentDialog = async (booking) => {
        try {
            const batteryResponse = await batteriesApi.getBatteryByCode(booking.batteryModelId);
            const batteryData = batteryResponse?.data || batteryResponse;

            // Nếu booking có packageId (subscriptionId), fetch thông tin gói
            let sub = null;
            if (booking.packageId) {
                try {
                    const resp = await (await import("@/api/subscriptionPackageApi")).subscriptionPackageApi.getSubscriptionById(booking.packageId);
                    const data = resp?.data || resp;
                    if (data?.status === "ACTIVE" && data?.usedSwaps < data?.packageMaxSwapPerMonth) {
                        sub = data;
                    }
                } catch (e) {
                    console.warn("Không thể lấy subscription:", e);
                }
            }
            setSubscriptionInfo(sub);

            setPaymentDialog({ open: true, booking, battery: batteryData });
        } catch {
            toast.error("Không thể tải thông tin pin");
        }
    };

    // Handler: Tạo thanh toán
    const handleCreatePayment = async (paymentData, extra = {}) => {
        try {
            // 1. Tạo payment
            const response = await createPaymentMutation.mutateAsync(paymentData);
            const paymentId = response?.data?.id || response?.id;

            if (!paymentId) {
                toast.error("Không nhận được payment ID");
                setPaymentDialog({ open: false, booking: null, battery: null });
                return;
            }

            // 2. Update booking với paymentId
            await updateBookingMutation.mutateAsync({
                id: paymentDialog.booking.id,
                data: { paymentId: paymentId }
            });

            // 3. Nếu dùng gói → xác nhận thanh toán tiền mặt ngay (SUCCESS) và tăng lượt swap
            if (extra?.usePackage) {
                try {
                    // Sử dụng mutations để auto refetch
                    await confirmCashPaymentMutation.mutateAsync(paymentId);
                    await confirmBookingPaymentMutation.mutateAsync(paymentDialog.booking.id);

                    // Gọi incrementSwaps để tăng usedSwaps trong subscription
                    if (paymentDialog.booking.packageId) {
                        await subscriptionPackageApi.incrementSwaps(paymentDialog.booking.packageId);
                        toast.success("Đã xác nhận thanh toán và trừ lượt swap trong gói!");
                    } else {
                        toast.success("Đã xác nhận thanh toán qua gói!");
                    }
                } catch (err) {
                    console.error(err);
                    toast.error("Không thể xác nhận hoặc trừ lượt swap gói");
                }
            } else {
                // Không dùng gói → chỉ tạo hóa đơn, xác nhận thanh toán sẽ làm ở bảng
                toast.success("Đã tạo hóa đơn! Vui lòng xác nhận thanh toán ở danh sách booking.");
            }

            // 4. Đóng dialog
            setPaymentDialog({ open: false, booking: null, battery: null });
            setSubscriptionInfo(null);
        } catch {
            toast.error("Lỗi khi tạo thanh toán");
            setPaymentDialog({ open: false, booking: null, battery: null });
            setSubscriptionInfo(null);
        }
    };

    // Handler: Xác nhận thanh toán tiền mặt
    const handleConfirmCashPayment = async (paymentId, bookingId) => {
        try {
            // 1. Xác nhận thanh toán (chuyển status từ PENDING sang SUCCESS)
            await confirmCashPaymentMutation.mutateAsync(paymentId);

            // 2. Xác nhận booking đã thanh toán (chuyển isPaid sang true) - tự động refetch
            await confirmBookingPaymentMutation.mutateAsync(bookingId);

        } catch (error) {
            console.error("Error confirming cash payment:", error);
            toast.error("Lỗi khi xác nhận thanh toán!");
        }
    };

    // Handler: Mở dialog swap
    const handleOpenSwapDialog = async (booking) => {
        try {
            const batteryResponse = await batteriesApi.getBatteryByCode(booking.batteryModelId);
            const batteryData = batteryResponse?.data || batteryResponse;
            setSwapDialog({ open: true, booking, battery: batteryData });
        } catch {
            toast.error("Không thể tải thông tin pin");
        }
    };

    // Handler: Hoàn tất swap
    const handleSwapComplete = async (swapData, batteryUpdateData, oldBatteryId) => {
        try {
            // 1. Ghi swap log
            await swapBatteryMutation.mutateAsync(swapData);

            // 2. Update pin cũ
            await updateBatteryMutation.mutateAsync({
                batteryCode: oldBatteryId,
                data: batteryUpdateData,
            });

            // 3. Complete booking (ép id thành string)
            const bookingId = swapDialog?.booking?.id;
            const paymentId = swapDialog?.booking?.paymentId;
            if (!bookingId) {
                toast.error("Không tìm thấy mã booking để hoàn tất");
                return;
            }
            await completeBookingMutation.mutateAsync({
                id: Number(bookingId),
                paymentId: Number(paymentId),
            });
        } catch {
            toast.error("Lỗi khi hoàn tất đổi pin");
        }
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusMap = {
            PENDING: { label: "Chờ duyệt", className: "bg-yellow-500 text-white" },
            CONFIRM: { label: "Đã duyệt", className: "bg-blue-500 text-white" },
            COMPLETE: { label: "Hoàn thành", className: "bg-green-500 text-white" },
            CANCEL: { label: "Đã hủy", className: "bg-red-500 text-white" },
        };
        return statusMap[status] || { label: status, className: "bg-gray-500 text-white" };
    };

    // Render action buttons
    const renderActionButtons = (booking) => {
        return (
            <div className="flex items-center gap-2 justify-end">
                {/* Nút Chi tiết luôn hiển thị */}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDetailDialog({ open: true, booking })}
                    className="gap-2"
                >
                    <FileText className="h-4 w-4" />
                    Chi tiết
                </Button>

                {/* Các nút action theo trạng thái */}
                {booking.bookingStatus === "PENDING" && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenConfirmDialog(booking)}
                        className="gap-2"
                    >
                        <CheckCircle className="h-4 w-4" />
                        Xử lý
                    </Button>
                )}

                {/* Hiển thị nút Tạo hóa đơn: CONFIRM + chưa có paymentId */}
                {booking.bookingStatus === "CONFIRM" && !booking.paymentId && (
                    <Button
                        size="sm"
                        onClick={() => handleOpenPaymentDialog(booking)}
                        className="gap-2"
                    >
                        <DollarSign className="h-4 w-4" />
                        Tạo hóa đơn
                    </Button>
                )}

                {/* Đã có paymentId nhưng chưa thanh toán: hiển thị nút xác nhận thanh toán CASH */}
                {booking.bookingStatus === "CONFIRM" && booking.paymentId && !booking.isPaid && (
                    <Button
                        size="sm"
                        onClick={() => handleConfirmCashPayment(booking.paymentId, booking.id)}
                        className="gap-2 bg-orange-600 hover:bg-orange-700"
                    >
                        <BadgeCheck className="h-4 w-4" />
                        Xác nhận thanh toán
                    </Button>
                )}

                {/* Đã thanh toán: hiển thị nút Đổi pin */}
                {booking.bookingStatus === "CONFIRM" && booking.isPaid && (
                    <Button
                        size="sm"
                        onClick={() => handleOpenSwapDialog(booking)}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Đổi pin
                    </Button>
                )}

                {booking.bookingStatus === "COMPLETE" && (
                    <Badge className="bg-green-100 text-green-700 border-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Đã xong
                    </Badge>
                )}

                {booking.bookingStatus === "CANCEL" && (
                    <Badge className="bg-red-100 text-red-700 border-red-300">
                        <XCircle className="h-3 w-3 mr-1" />
                        Đã hủy
                    </Badge>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        Quản lý Đặt Lịch & Đổi Pin
                    </h1>
                    <p className="text-slate-600 mt-1">
                        Xử lý booking và thực hiện đổi pin cho khách hàng
                    </p>
                </div>
                <Button onClick={() => refetchBookings()} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    {isLoadingBookings ? "Đang tải..." : "Làm mới"}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatsCard
                    title="Tổng số"
                    value={stats.total}
                    icon={Calendar}
                    bgColor="bg-blue-100"
                    textColor="text-blue-600"
                />
                <StatsCard
                    title="Chờ duyệt"
                    value={stats.pending}
                    icon={Clock}
                    bgColor="bg-yellow-100"
                    textColor="text-yellow-600"
                />
                <StatsCard
                    title="Đã duyệt"
                    value={stats.confirm}
                    icon={CheckCircle}
                    bgColor="bg-blue-100"
                    textColor="text-blue-600"
                />
                <StatsCard
                    title="Hoàn thành"
                    value={stats.complete}
                    icon={Battery}
                    bgColor="bg-green-100"
                    textColor="text-green-600"
                />
                <StatsCard
                    title="Đã hủy"
                    value={stats.cancel}
                    icon={XCircle}
                    bgColor="bg-red-100"
                    textColor="text-red-600"
                />
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm theo mã booking, khách hàng, mã pin..."
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
                                <SelectItem value="ALL">Tất cả</SelectItem>
                                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                                <SelectItem value="CONFIRM">Đã duyệt</SelectItem>
                                <SelectItem value="COMPLETE">Hoàn thành</SelectItem>
                                <SelectItem value="CANCEL">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            {isLoadingBookings ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                    ))}
                </div>
            ) : filteredBookings.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">Không tìm thấy booking nào</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã Booking</TableHead>
                                        <TableHead>Khách hàng</TableHead>
                                        <TableHead>Mã Pin</TableHead>
                                        <TableHead>Thời gian hẹn</TableHead>
                                        <TableHead>Thanh toán</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBookings.map((booking) => {
                                        const statusInfo = getStatusBadge(booking.bookingStatus);
                                        return (
                                            <TableRow key={booking.id}>
                                                <TableCell className="font-medium">
                                                    #{booking.id}
                                                </TableCell>
                                                <TableCell>{booking.driverId}</TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {booking.batteryModelId}
                                                </TableCell>
                                                <TableCell>
                                                    {booking.scheduledTime
                                                        ? new Date(
                                                              booking.scheduledTime
                                                          ).toLocaleString("vi-VN")
                                                        : "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            booking.isPaid
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-yellow-100 text-yellow-700"
                                                        }
                                                    >
                                                        {booking.isPaid ? "Đã TT" : "Chưa TT"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusInfo.className}>
                                                        {statusInfo.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {renderActionButtons(booking)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Dialogs */}
            <BookingConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) =>
                    !open && setConfirmDialog({ open: false, booking: null, battery: null })
                }
                booking={confirmDialog.booking}
                batteryInfo={confirmDialog.battery}
                onConfirm={handleConfirmBooking}
                onCancel={handleCancelBooking}
                isLoading={confirmBookingMutation.isLoading || cancelBookingMutation.isLoading}
            />

            <PaymentSwapDialog
                open={paymentDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setPaymentDialog({ open: false, booking: null, battery: null });
                        setSubscriptionInfo(null);
                    }
                }}
                booking={paymentDialog.booking}
                batteryInfo={paymentDialog.battery}
                stationId={stationCode}
                subscription={subscriptionInfo}
                onCreatePayment={handleCreatePayment}
                isLoading={createPaymentMutation.isLoading}
            />

            <SwapLogDialog
                open={swapDialog.open}
                onOpenChange={(open) =>
                    !open && setSwapDialog({ open: false, booking: null, battery: null })
                }
                booking={swapDialog.booking}
                batteryInfo={swapDialog.battery}
                stationId={stationCode}
                onSwapComplete={handleSwapComplete}
                isLoading={
                    swapBatteryMutation.isLoading ||
                    updateBatteryMutation.isLoading ||
                    completeBookingMutation.isLoading
                }
            />

            <BookingDetailDialog
                open={detailDialog.open}
                onOpenChange={(open) => !open && setDetailDialog({ open: false, booking: null })}
                booking={detailDialog.booking}
            />
        </div>
    );
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, bgColor, textColor }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">{title}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${bgColor}`}>
                        {Icon && <Icon className={`h-5 w-5 ${textColor}`} />}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
