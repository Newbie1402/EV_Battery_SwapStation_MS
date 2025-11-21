import { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wallet, CreditCard } from "lucide-react";
import { Receipt, AlertCircle, BadgeCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/utils/format";

export default function PaymentSwapDialog({
    open,
    onOpenChange,
    booking,
    batteryInfo,
    stationId,
    subscription, // optional: thông tin gói
    onCreatePayment,
    isLoading,
}) {
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [description, setDescription] = useState("");

    const isUsingPackage = !!subscription;

    // Tổng tiền: nếu dùng gói => 0; ngược lại capacity * 10,000 VNĐ
    const totalAmount = useMemo(() => {
        if (isUsingPackage) return 0;
        return batteryInfo ? batteryInfo.capacity * 10000 : 0;
    }, [isUsingPackage, batteryInfo]);

    const defaultDescription = useMemo(() => {
        if (!booking) return "";
        if (isUsingPackage) {
            const planName = subscription?.packagePlanName || "Gói tháng";
            return `Thanh toán đổi pin - Booking #${booking.id} (đã thanh toán qua gói ${planName})`;
        }
        return `Thanh toán đổi pin - Booking #${booking.id}`;
    }, [booking, isUsingPackage, subscription]);

    const handleSubmit = () => {
        if (!booking) return;

        const payload = {
            customerId: booking.driverId,
            totalAmount: totalAmount,
            method: "CASH",
            status: isUsingPackage ? "SUCCESS" : "PENDING",
            description: (description || defaultDescription),
            bookingId: booking.id,
            stationId: stationId,
        };

        // Nếu dùng gói, cần gửi thêm packageId để backend ghi nhận
        const extra = {
            usePackage: isUsingPackage,
            packageId: isUsingPackage ? booking.packageId : undefined,
        };

        onCreatePayment(payload, extra);
        setDescription("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary" />
                        Tạo Hóa Đơn Thanh Toán
                    </DialogTitle>
                    <DialogDescription>
                        {isUsingPackage
                            ? "Sử dụng gói đăng ký để thanh toán lượt đổi pin"
                            : "Tạo hóa đơn thanh toán cho dịch vụ đổi pin"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Thông tin booking */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2">
                        <h4 className="font-semibold text-sm">Thông tin giao dịch</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <p className="text-slate-500">Mã Booking:</p>
                                <p className="font-medium">#{booking?.id}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Khách hàng:</p>
                                <p className="font-medium">{booking?.driverId}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Mã pin:</p>
                                <p className="font-medium font-mono">{batteryInfo?.batteryCode}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Dung lượng:</p>
                                <p className="font-medium">{batteryInfo?.capacity} kWh</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Nếu dùng gói → hiển thị thông tin gói */}
                    {isUsingPackage && (
                        <div className="space-y-3 p-4 rounded-lg border border-emerald-200 bg-emerald-50">
                            <div className="flex items-center gap-2 text-emerald-700">
                                <BadgeCheck className="h-4 w-4" />
                                <span className="font-semibold">Thanh toán bằng gói</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-slate-500">Tên gói:</p>
                                    <p className="font-medium">{subscription?.packagePlanName}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Trạng thái:</p>
                                    <p className="font-medium">{subscription?.status}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Kỳ hạn:</p>
                                    <p className="font-medium">
                                        {subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString("vi-VN") : ""}
                                        {" - "}
                                        {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString("vi-VN") : ""}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Số lượt/tháng:</p>
                                    <p className="font-medium">{subscription?.usedSwaps}/{subscription?.packageMaxSwapPerMonth}</p>
                                </div>
                            </div>
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    Lượt đổi pin này sẽ được trừ vào gói hiện tại. Tổng tiền thanh toán là 0đ.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {/* Chi tiết thanh toán */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Chi tiết thanh toán</h4>
                        <div className="space-y-2 text-sm">
                            {!isUsingPackage && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Dung lượng pin:</span>
                                        <span className="font-medium">{batteryInfo?.capacity} kWh</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Đơn giá:</span>
                                        <span className="font-medium">{formatCurrency(10000)}/kWh</span>
                                    </div>
                                    <Separator />
                                </>
                            )}
                            <div className="flex justify-between text-base font-bold">
                                <span>Tổng cộng:</span>
                                <span className="text-primary">{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />


                    {/* Phương thức thanh toán */}
                    {!isUsingPackage && (
                        <div className="space-y-3">
                            <Label>Phương thức thanh toán</Label>
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                                    <RadioGroupItem value="CASH" id="cash" />
                                    <Label
                                        htmlFor="cash"
                                        className="flex items-center gap-2 cursor-pointer flex-1"
                                    >
                                        <Wallet className="h-4 w-4 text-green-600" />
                                        <div>
                                            <p className="font-medium">Tiền mặt</p>
                                            <p className="text-xs text-slate-500">
                                                Thanh toán trực tiếp tại quầy
                                            </p>
                                        </div>
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                                    <RadioGroupItem value="VNPAY" id="vnpay" />
                                    <Label
                                        htmlFor="vnpay"
                                        className="flex items-center gap-2 cursor-pointer flex-1"
                                    >
                                        <CreditCard className="h-4 w-4 text-blue-600" />
                                        <div>
                                            <p className="font-medium">VNPAY</p>
                                            <p className="text-xs text-slate-500">
                                                Thanh toán qua cổng VNPAY
                                            </p>
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    {/* Ghi chú */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Ghi chú (Tùy chọn)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={defaultDescription}
                            className="min-h-20"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
                        <Receipt className="h-4 w-4" />
                        {isLoading ? "Đang xử lý..." : "Tạo hóa đơn"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
