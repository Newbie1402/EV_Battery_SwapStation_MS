import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Battery, CheckCircle, XCircle } from "lucide-react";

export default function BookingConfirmDialog({
    open,
    onOpenChange,
    booking,
    batteryInfo,
    onConfirm,
    onCancel,
    isLoading,
}) {
    const [cancelReason, setCancelReason] = useState("");

    const handleConfirm = () => {
        onConfirm(booking.id);
        setCancelReason("");
    };

    const handleCancel = (reason) => {
        const finalReason = reason || cancelReason;
        if (!finalReason.trim()) {
            return;
        }
        onCancel(booking.id, finalReason);
        setCancelReason("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Battery className="h-5 w-5 text-primary" />
                        Xác nhận Booking #{booking?.id}
                    </DialogTitle>
                    <DialogDescription>
                        Kiểm tra thông tin booking và pin trước khi xác nhận
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Thông tin booking */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-3">
                        <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                            Thông tin đặt lịch
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-slate-500">Khách hàng:</p>
                                <p className="font-medium">{booking?.driverId}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Thời gian hẹn:</p>
                                <p className="font-medium">
                                    {booking?.scheduledTime
                                        ? new Date(booking.scheduledTime).toLocaleString("vi-VN")
                                        : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500">Loại thanh toán:</p>
                                <p className="font-medium">{booking?.paymentType}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Mã pin yêu cầu:</p>
                                <p className="font-medium">{booking?.batteryModelId}</p>
                            </div>
                        </div>
                        {booking?.notes && (
                            <div>
                                <p className="text-slate-500 text-sm">Ghi chú:</p>
                                <p className="text-sm italic">{booking.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Thông tin pin */}
                    {batteryInfo && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-3">
                            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                                Thông tin pin
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-slate-500">Mã pin:</p>
                                    <p className="font-medium">{batteryInfo.batteryCode}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Model:</p>
                                    <p className="font-medium">{batteryInfo.model}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Dung lượng:</p>
                                    <p className="font-medium">{batteryInfo.capacity} kWh</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Trạng thái:</p>
                                    <Badge
                                        className={
                                            batteryInfo.status === "FULL"
                                                ? "bg-green-500"
                                                : "bg-yellow-500"
                                        }
                                    >
                                        {batteryInfo.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-slate-500">SOC:</p>
                                    <p className="font-medium">{batteryInfo.soc}%</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">SOH:</p>
                                    <p className="font-medium">{batteryInfo.soh}%</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cảnh báo nếu pin đang bị hold */}
                    {batteryInfo?.hold && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Pin này đã có người đặt trước hoặc đang được giữ. Bạn chỉ có thể hủy
                                booking này.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Form hủy booking */}
                    {batteryInfo?.hold && (
                        <div className="space-y-2">
                            <Label htmlFor="cancelReason">Lý do hủy *</Label>
                            <Textarea
                                id="cancelReason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Nhập lý do hủy booking..."
                                className="min-h-20"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Đóng
                    </Button>

                    {batteryInfo?.hold ? (
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={isLoading || !cancelReason.trim()}
                            className="gap-2"
                        >
                            <XCircle className="h-4 w-4" />
                            Hủy Booking
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => handleCancel("Hủy bởi nhân viên")}
                                disabled={isLoading}
                                className="gap-2"
                            >
                                <XCircle className="h-4 w-4" />
                                Hủy
                            </Button>
                            <Button onClick={handleConfirm} disabled={isLoading} className="gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Xác nhận
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

