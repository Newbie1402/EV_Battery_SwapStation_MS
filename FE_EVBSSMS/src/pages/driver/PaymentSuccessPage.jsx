import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Package, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { subscriptionPackageApi, packagePlanApi, paymentApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/utils/format";
import toast from "react-hot-toast";

export default function PaymentSuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { userId } = useAuthStore();

    const [isProcessing, setIsProcessing] = useState(true);
    const [status, setStatus] = useState("processing"); // processing, success, error
    const [packageInfo, setPackageInfo] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    // Lấy params từ URL (được VNPAY redirect về)
    // Format: ?type=PACKAGE&vnp_ResponseCode=00&vnp_TxnRef=17&vnp_Amount=...
    // vnp_ResponseCode = "00" → thành công
    // vnp_TxnRef → paymentId
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    const vnp_TxnRef = searchParams.get("vnp_TxnRef");
    const paymentId = vnp_TxnRef;

    console.log("Payment Success Params:", vnp_ResponseCode, paymentId);

    useEffect(() => {
        const handlePaymentSuccess = async () => {
            // Kiểm tra params
            if (!paymentId) {
                setStatus("error");
                setErrorMessage("Thiếu thông tin thanh toán!");
                setIsProcessing(false);
                toast.error("Thiếu thông tin thanh toán!");
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

            try {
                // Bước 1: Lấy thông tin payment để có packageId
                const paymentData = await paymentApi.getPaymentPackageById(paymentId);

                if (!paymentData || !paymentData.packageId) {
                    throw new Error("Không tìm thấy thông tin gói trong thanh toán!");
                }

                const packageId = paymentData.packageId;

                // Bước 2: Lấy thông tin gói
                const packageData = await packagePlanApi.getPackagePlanById(packageId);
                setPackageInfo(packageData);

                // Bước 3: Thêm user vào gói subscription
                const subscriptionData = {
                    userId: userId,
                    packagePlanId: packageId
                };

                await subscriptionPackageApi.subscriptionUserPackage(subscriptionData);

                // Thành công
                setStatus("success");
                toast.success("Đăng ký gói thành công!");
            } catch (error) {
                console.error("Subscription error:", error);
                setStatus("error");
                setErrorMessage(error.message || "Có lỗi xảy ra khi kích hoạt gói!");
                toast.error("Có lỗi xảy ra khi kích hoạt gói!");
            } finally {
                setIsProcessing(false);
            }
        };

        handlePaymentSuccess();
    }, [paymentId, vnp_ResponseCode, userId]);

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
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl text-green-700">
                                Thanh toán thành công!
                            </CardTitle>
                            <CardDescription className="text-base">
                                Gói dịch vụ của bạn đã được kích hoạt
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Package Info */}
                            {packageInfo && (
                                <>
                                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-600">
                                                Tên gói:
                                            </span>
                                            <span className="font-semibold text-slate-800">
                                                {packageInfo.name}
                                            </span>
                                        </div>
                                        <Separator />
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
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800">
                                            <strong>Lưu ý:</strong> Gói dịch vụ của bạn đã được kích hoạt ngay lập tức.
                                            Bạn có thể bắt đầu sử dụng dịch vụ đổi pin tại các trạm trong hệ thống.
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
                                    onClick={() => navigate("/driver/packages")}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Package className="mr-2 h-4 w-4" />
                                    Xem gói của tôi
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

