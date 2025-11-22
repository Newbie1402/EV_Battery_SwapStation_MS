import { useState, useEffect } from "react";
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
import { CreditCard, Wallet, Receipt, Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { vnpayApi, paymentApi } from "@/api";
import { toast } from "react-hot-toast";

export default function BookingPaymentDialog({ open, onOpenChange, booking, onPaymentSuccess }) {
    const [paymentDetail, setPaymentDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Load payment detail khi dialog mở
    useEffect(() => {
        const fetchPaymentDetail = async () => {
            if (open && booking?.paymentId) {
                setIsLoading(true);
                try {
                    const response = await paymentApi.getPaymentSwapById(booking.paymentId);
                    const data = response?.data || response;
                    setPaymentDetail(data);
                } catch (error) {
                    toast.error("Không thể tải thông tin thanh toán");
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchPaymentDetail();
    }, [open, booking]);

    const handlePayment = async () => {
        if (!paymentDetail) return;

        setIsProcessing(true);
        try {
            // Nếu method là VNPAY, gọi API tạo VNPAY URL
            if (paymentDetail.method === "VNPAY") {
                const vnpayResponse = await vnpayApi.createVnpay({
                    paymentId: paymentDetail.id,
                    type: "SINGLE",
                });

                const paymentUrl = vnpayResponse?.data || vnpayResponse;

                if (paymentUrl) {
                    toast.success("Đang chuyển đến cổng thanh toán VNPAY...");
                    // Redirect đến VNPAY
                    window.location.href = paymentUrl;
                } else {
                    toast.error("Không nhận được URL thanh toán");
                }
            } else if (paymentDetail.method === "CASH") {
                toast.success("Vui lòng thanh toán trực tiếp tại trạm");
                onOpenChange(false);
            } else {
                toast.error("Phương thức thanh toán không hỗ trợ online");
                onOpenChange(false);
            }
        } catch (error) {
            toast.error("Lỗi khi xử lý thanh toán");
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case "VNPAY":
                return <CreditCard className="h-4 w-4 text-blue-600" />;
            case "CASH":
                return <Wallet className="h-4 w-4 text-green-600" />;
            default:
                return <Receipt className="h-4 w-4" />;
        }
    };

    const getPaymentMethodLabel = (method) => {
        switch (method) {
            case "VNPAY":
                return "VNPAY";
            case "CASH":
                return "Tiền mặt";
            case "BANK_TRANSFER":
                return "Chuyển khoản";
            default:
                return method;
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            PENDING: { label: "Chờ thanh toán", className: "bg-yellow-500 text-white" },
            SUCCESS: { label: "Thành công", className: "bg-green-500 text-white" },
            FAILED: { label: "Thất bại", className: "bg-red-500 text-white" },
            REFUNDED: { label: "Đã hoàn tiền", className: "bg-gray-500 text-white" },
        };
        return statusMap[status] || { label: status, className: "bg-gray-500 text-white" };
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-5xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary" />
                        Chi tiết Thanh toán - Booking #{booking?.id}
                    </DialogTitle>
                    <DialogDescription>
                        Thông tin chi tiết hóa đơn thanh toán dịch vụ đổi pin
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : paymentDetail ? (
                    <div className="space-y-4">
                        {/* Thông tin hóa đơn */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2">
                            <h4 className="font-semibold text-sm">Thông tin hóa đơn</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-slate-500">Mã thanh toán:</p>
                                    <p className="font-medium">#{paymentDetail.id}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Mã booking:</p>
                                    <p className="font-medium">#{paymentDetail.bookingId}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Trạng thái:</p>
                                    <Badge className={getStatusBadge(paymentDetail.status).className}>
                                        {getStatusBadge(paymentDetail.status).label}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-slate-500">Phương thức:</p>
                                    <div className="flex items-center gap-1 font-medium">
                                        {getPaymentMethodIcon(paymentDetail.method)}
                                        {getPaymentMethodLabel(paymentDetail.method)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Chi tiết thanh toán */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Chi tiết thanh toán</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Tổng tiền:</span>
                                    <span className="font-bold text-primary text-base">
                                        {formatCurrency(paymentDetail.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {paymentDetail.description && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Ghi chú:</h4>
                                    <p className="text-sm text-slate-600 italic bg-slate-50 dark:bg-slate-900 p-3 rounded">
                                        {paymentDetail.description}
                                    </p>
                                </div>
                            </>
                        )}

                        {paymentDetail.paymentTime && (
                            <>
                                <Separator />
                                <div className="text-xs text-slate-500">
                                    <p>
                                        Thời gian thanh toán:{" "}
                                        {new Date(paymentDetail.paymentTime).toLocaleString("vi-VN")}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        Không tìm thấy thông tin thanh toán
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                        Đóng
                    </Button>
                    {paymentDetail && paymentDetail.status === "PENDING" && (
                        <Button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    {getPaymentMethodIcon(paymentDetail.method)}
                                    Thanh toán
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

