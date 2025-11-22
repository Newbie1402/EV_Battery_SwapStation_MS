import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Battery, DollarSign, MapPin, Clock, FileText } from "lucide-react";

export default function BookingDetailDialog({ open, onOpenChange, booking }) {
    if (!booking) return null;

    const getStatusBadge = (status) => {
        const statusMap = {
            PENDING: { label: "Chờ duyệt", className: "bg-yellow-500 text-white" },
            CONFIRMED: { label: "Đã duyệt", className: "bg-blue-500 text-white" },
            COMPLETED: { label: "Hoàn thành", className: "bg-green-500 text-white" },
            CANCELLED: { label: "Đã hủy", className: "bg-red-500 text-white" },
        };
        return statusMap[status] || { label: status, className: "bg-gray-500 text-white" };
    };

    const statusInfo = getStatusBadge(booking.bookingStatus);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Chi tiết Booking #{booking.id}
                    </DialogTitle>
                    <DialogDescription>
                        Thông tin chi tiết về đặt lịch đổi pin
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Trạng thái */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-slate-500" />
                            <span className="font-semibold">Trạng thái:</span>
                        </div>
                        <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                    </div>

                    <Separator />

                    {/* Thông tin khách hàng */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Thông tin khách hàng
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm pl-6">
                            <div>
                                <p className="text-slate-500">Mã khách hàng:</p>
                                <p className="font-medium">{booking.driverId}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Thông tin trạm */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Thông tin trạm
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm pl-6">
                            <div>
                                <p className="text-slate-500">Mã trạm:</p>
                                <p className="font-medium">{booking.stationId}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Thông tin pin */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Battery className="h-4 w-4" />
                            Thông tin pin yêu cầu
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm pl-6">
                            <div>
                                <p className="text-slate-500">Mã pin:</p>
                                <p className="font-medium font-mono">{booking.batteryModelId}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Thông tin đặt lịch */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Thông tin đặt lịch
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm pl-6">
                            <div>
                                <p className="text-slate-500">Thời gian đặt:</p>
                                <p className="font-medium">
                                    {booking.bookingTime
                                        ? new Date(booking.bookingTime).toLocaleString("vi-VN")
                                        : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500">Thời gian hẹn:</p>
                                <p className="font-medium">
                                    {booking.scheduledTime
                                        ? new Date(booking.scheduledTime).toLocaleString("vi-VN")
                                        : "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Thông tin thanh toán */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Thông tin thanh toán
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm pl-6">
                            <div>
                                <p className="text-slate-500">Loại thanh toán:</p>
                                <p className="font-medium">{booking.paymentType}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Trạng thái TT:</p>
                                <Badge
                                    className={
                                        booking.isPaid
                                            ? "bg-green-100 text-green-700 border-green-300"
                                            : "bg-yellow-100 text-yellow-700 border-yellow-300"
                                    }
                                >
                                    {booking.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                                </Badge>
                            </div>
                            {booking.paymentId && (
                                <div>
                                    <p className="text-slate-500">Mã thanh toán:</p>
                                    <p className="font-medium">#{booking.paymentId}</p>
                                </div>
                            )}
                            {booking.packageId && (
                                <div>
                                    <p className="text-slate-500">Mã gói:</p>
                                    <p className="font-medium">{booking.packageId}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ghi chú */}
                    {booking.notes && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Ghi chú:</h4>
                                <p className="text-sm text-slate-600 italic bg-slate-50 dark:bg-slate-900 p-3 rounded">
                                    {booking.notes}
                                </p>
                            </div>
                        </>
                    )}

                    {/* Thời gian tạo/cập nhật */}
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
                        <div>
                            <p>Tạo lúc:</p>
                            <p className="font-medium">
                                {booking.createdAt
                                    ? new Date(booking.createdAt).toLocaleString("vi-VN")
                                    : "N/A"}
                            </p>
                        </div>
                        <div>
                            <p>Cập nhật lúc:</p>
                            <p className="font-medium">
                                {booking.updatedAt
                                    ? new Date(booking.updatedAt).toLocaleString("vi-VN")
                                    : "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

