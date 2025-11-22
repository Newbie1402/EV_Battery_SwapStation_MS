import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Package, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { subscriptionPackageApi, packagePlanApi, paymentApi, vnpayApi, bookingApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/utils/format";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function PaymentSuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { employeeId } = useAuthStore();

    const [isProcessing, setIsProcessing] = useState(true);
    const [status, setStatus] = useState("processing"); // processing, success, error
    const [packageInfo, setPackageInfo] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    // Ref để đảm bảo chỉ chạy một lần duy nhất
    const hasProcessed = useRef(false);

    // Lấy params từ URL (được VNPAY redirect về)
    // Format: ?type=SINGLE&vnp_ResponseCode=00&vnp_TxnRef=9&vnp_Amount=...
    // type=SINGLE → thanh toán booking (swap)
    // type=PACKAGE hoặc không có → thanh toán package subscription
    // vnp_ResponseCode = "00" → thành công
    // vnp_TxnRef → paymentId
    const type = searchParams.get("type"); // SINGLE or PACKAGE
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    const paymentId = searchParams.get("vnp_TxnRef");

    // Lấy tất cả vnp_* params + type để gửi callback (wrap trong useMemo)
    const vnpayParams = useMemo(() => {
        const params = {};
        searchParams.forEach((value, key) => {
            if (key.startsWith("vnp_") || key === "type") {
                params[key] = value;
            }
        });
        return params;
    }, [searchParams]);

    console.log("Payment Success Params:", { type, vnp_ResponseCode, paymentId, vnpayParams });

    useEffect(() => {
        const handlePaymentSuccess = async () => {
            // Kiểm tra nếu đã xử lý rồi thì bỏ qua
            if (hasProcessed.current) {
                console.log("Payment already processed, skipping...");
                return;
            }

            // Kiểm tra params
            if (!paymentId) {
                setStatus("error");
                setErrorMessage("Thiếu thông tin thanh toán!");
                setIsProcessing(false);
                toast.error("Thiếu thông tin thanh toán!");
                return;
            }

            // Kiểm tra xem payment này đã được xử lý chưa (từ localStorage)
            const processedPaymentKey = `processed_payment_${paymentId}`;
            const alreadyProcessed = localStorage.getItem(processedPaymentKey);

            if (alreadyProcessed) {
                console.log("Payment already processed (from localStorage), showing success...");
                hasProcessed.current = true;
                setStatus("success");
                setIsProcessing(false);

                // Load lại thông tin package từ localStorage nếu có
                try {
                    const savedInfo = JSON.parse(alreadyProcessed);
                    setPackageInfo(savedInfo);
                } catch (e) {
                    console.error("Error parsing saved package info:", e);
                }
                return;
            }

            // Kiểm tra response code từ VNPAY
            // vnp_ResponseCode = "00" nghĩa là thành công
            if (vnp_ResponseCode !== "00") {
                setStatus("error");
                setErrorMessage("Thanh toán không thành công! Vui lòng thử lại.");
                setIsProcessing(false);
                toast.error("Thanh toán không thành công!");
                return;
            }

            // Đánh dấu đã bắt đầu xử lý
            hasProcessed.current = true;

            try {
                // Bước 1: Gọi vnpayCallback với tất cả query params
                console.log("Calling vnpayCallback with params:", vnpayParams);
                await vnpayApi.vnpayCallback(vnpayParams);
                console.log("vnpayCallback success");

                // Biến để lưu thông tin package
                let processedPackageInfo = null;

                // Bước 2: Xử lý theo type
                if (type === "SINGLE") {
                    // ===== Xử lý thanh toán BOOKING (SWAP) =====
                    console.log("Processing SINGLE payment (booking):", paymentId);

                    // Lấy thông tin payment swap
                    const paymentData = await paymentApi.getPaymentSwapById(paymentId);

                    // Gọi confirmBookingPayment để cập nhật isPaid = true cho booking
                    if (paymentData.bookingId) {
                        await bookingApi.confirmBookingPayment(paymentData.bookingId);
                        console.log("Booking payment confirmed for booking:", paymentData.bookingId);
                    }

                    processedPackageInfo = {
                        name: `Thanh toán đổi pin - Booking #${paymentData.bookingId}`,
                        packageType: "SWAP",
                        totalAmount: paymentData.totalAmount
                    };

                    setPackageInfo(processedPackageInfo);
                    setStatus("success");

                } else {
                    // ===== Xử lý thanh toán PACKAGE SUBSCRIPTION =====
                    console.log("Processing PACKAGE payment:", paymentId);

                    // Kiểm tra xem có phải là gia hạn không
                    const extendInfoStr = localStorage.getItem('extendInfo');
                    let extendInfo = null;

                    if (extendInfoStr) {
                        try {
                            extendInfo = JSON.parse(extendInfoStr);
                            // Kiểm tra xem paymentId có khớp không
                            if (extendInfo.paymentId !== paymentId) {
                                extendInfo = null; // Không khớp, bỏ qua
                            }
                        } catch (e) {
                            console.error("Error parsing extendInfo:", e);
                        }
                    }

                    // Lấy thông tin payment để có packageId
                    const paymentData = await paymentApi.getPaymentPackageById(paymentId);

                    if (!paymentData || !paymentData.packageId) {
                        throw new Error("Không tìm thấy thông tin gói trong thanh toán!");
                    }

                    const packageId = paymentData.packageId;

                    // Lấy thông tin gói
                    const packageData = await packagePlanApi.getPackagePlanById(packageId);
                    processedPackageInfo = packageData;
                    setPackageInfo(packageData);

                    // Xử lý theo trường hợp
                    if (extendInfo && extendInfo.subscriptionId) {
                        // Trường hợp gia hạn
                        console.log("Extending subscription:", extendInfo);

                        // Gọi API gia hạn
                        await subscriptionPackageApi.extendSubscription(
                            extendInfo.subscriptionId,
                            extendInfo.extendPeriods || 1
                        );

                        // Xóa thông tin gia hạn khỏi localStorage
                        localStorage.removeItem('extendInfo');

                        toast.success("Gia hạn gói thành công!");
                    } else {
                        // Trường hợp đăng ký mới
                        const subscriptionData = {
                            userId: employeeId,
                            packagePlanId: packageId,
                        };

                        await subscriptionPackageApi.createSubscription(subscriptionData);

                        toast.success("Đăng ký gói thành công!");
                    }

                    setStatus("success");
                }

                // Lưu thông tin vào localStorage để tránh xử lý lại
                const processedPaymentKey = `processed_payment_${paymentId}`;
                localStorage.setItem(processedPaymentKey, JSON.stringify(processedPackageInfo));

            } catch (error) {
                console.error("Payment processing error:", error);
                setStatus("error");
                setErrorMessage(error.message || "Có lỗi xảy ra khi xử lý thanh toán!");
                toast.error("Có lỗi xảy ra khi xử lý thanh toán!");

                // Xóa extendInfo nếu có lỗi
                localStorage.removeItem('extendInfo');

                // Reset hasProcessed để cho phép retry khi refresh trang
                hasProcessed.current = false;
            } finally {
                setIsProcessing(false);
            }
        };

        handlePaymentSuccess();
    }, [paymentId, vnp_ResponseCode, employeeId, type, vnpayParams]);

    // Toast thành công chỉ hiện một lần khi status chuyển sang success và type = SINGLE
    useEffect(() => {
        if (status === "success" && type === "SINGLE") {
            toast.success("Thanh toán đổi pin thành công! Bạn có thể đến trạm để thực hiện đổi pin.");
        }
    }, [status, type]);

    // Render processing state
    if (isProcessing) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                            Đang xử lý thanh toán...
                        </h3>
                        <p className="text-slate-600 text-sm">
                            Vui lòng đợi trong giây lát
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Render success state
    if (status === "success") {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
                <div className="container mx-auto px-4 max-w-2xl">
                    <Card className="border-green-200">
                        <CardHeader className="text-center pb-4">
                            <motion.div
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                            >
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </motion.div>
                            <CardTitle className="text-2xl text-green-700">
                                Thanh toán thành công!
                            </CardTitle>
                            <CardDescription className="text-base">
                                {packageInfo?.packageType === "SWAP"
                                    ? "Thanh toán dịch vụ đổi pin đã hoàn tất"
                                    : "Gói dịch vụ của bạn đã được kích hoạt"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Package/Booking Info */}
                            {packageInfo && (
                                <>
                                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-600">
                                                {packageInfo.packageType === "SWAP" ? "Dịch vụ:" : "Tên gói:"}
                                            </span>
                                            <span className="font-semibold text-slate-800">
                                                {packageInfo.name}
                                            </span>
                                        </div>
                                        <Separator />

                                        {packageInfo.packageType === "SWAP" ? (
                                            // Hiển thị cho thanh toán booking
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-slate-600">
                                                        Số tiền:
                                                    </span>
                                                    <span className="text-xl font-bold text-green-600">
                                                        {formatCurrency(packageInfo.totalAmount)}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            // Hiển thị cho package subscription
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-slate-600">
                                                        Loại gói:
                                                    </span>
                                                    <Badge variant="secondary">
                                                        {packageInfo.packageType === "MONTHLY" ? "Hàng tháng" : "Hàng năm"}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-slate-600">
                                                        Số lần đổi pin:
                                                    </span>
                                                    <span className="font-semibold text-slate-800">
                                                        {packageInfo.maxSwapPerMonth}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-slate-600">
                                                        Thời hạn:
                                                    </span>
                                                    <span className="font-semibold text-slate-800">
                                                        {packageInfo.packageType === "MONTHLY" ? "1" : "12"} tháng
                                                    </span>
                                                </div>
                                                <Separator />
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-slate-600">
                                                        Số tiền đã thanh toán:
                                                    </span>
                                                    <span className="text-xl font-bold text-green-600">
                                                        {formatCurrency(packageInfo.price)}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800">
                                            <strong>Lưu ý:</strong>{" "}
                                            {packageInfo.packageType === "SWAP"
                                                ? "Bạn có thể đến trạm để thực hiện đổi pin. Vui lòng mang theo mã booking."
                                                : "Gói dịch vụ của bạn đã được kích hoạt ngay lập tức. Bạn có thể bắt đầu sử dụng dịch vụ đổi pin tại các trạm trong hệ thống."
                                            }
                                        </p>
                                    </div>
                                </>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    onClick={() => navigate("/driver/dashboard")}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    Về trang chủ
                                </Button>
                                <Button
                                    onClick={() => navigate(type === "SINGLE" ? "/driver/bookings" : "/driver/packages")}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Package className="mr-2 h-4 w-4" />
                                    {type === "SINGLE" ? "Xem lịch đặt" : "Xem gói của tôi"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Render error state
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <Card className="border-red-200">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl text-red-700">
                            Thanh toán thất bại!
                        </CardTitle>
                        <CardDescription className="text-base">
                            {errorMessage || "Đã có lỗi xảy ra trong quá trình thanh toán"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800">
                                <strong>Lý do có thể:</strong>
                            </p>
                            <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                                <li>Giao dịch bị hủy</li>
                                <li>Số dư tài khoản không đủ</li>
                                <li>Thông tin thanh toán không chính xác</li>
                                <li>Lỗi kết nối với cổng thanh toán</li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                onClick={() => navigate("/pricing")}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                Thử lại
                            </Button>
                            <Button
                                onClick={() => navigate("/contact")}
                                variant="outline"
                                className="flex-1"
                            >
                                Liên hệ hỗ trợ
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

