import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    CreditCard,
    Wallet,
    ArrowLeft,
    CheckCircle2,
    Package,
    Clock,
    Shield,
    RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import useCustomQuery from "@/hooks/useCustomQuery";
import { packagePlanApi, paymentApi, vnpayApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/utils/format";
import toast from "react-hot-toast";

export default function PaymentPackagePage() {
    const { packageId: packageIdParam } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { employeeId } = useAuthStore();
    const [paymentMethod, setPaymentMethod] = useState("VNPAY");
    const [isProcessing, setIsProcessing] = useState(false);

    // Lấy thông tin gia hạn từ location state (nếu có)
    const { subscriptionId, extendPeriods, isExtend, isAutoExtend, packagePlanId } = location.state || {};
    const periods = extendPeriods || 1;

    // Sử dụng packageId từ state (nếu là extend) hoặc từ params (nếu là đăng ký mới)
    const packageId = packagePlanId || packageIdParam;
    console.log("PaymentPackagePage packageId:", packageId);

    // Lấy thông tin gói từ API
    const { data: packageData, isLoading, error } = useCustomQuery(
        ["packagePlan", packageId],
        () => packagePlanApi.getPackagePlanById(packageId),
        {
            enabled: !!packageId,
        }
    );

    // Redirect nếu không có packageId
    useEffect(() => {
        if (!packageId) {
            toast.error("Không tìm thấy gói dịch vụ!");
            navigate("/pricing");
        }
    }, [packageId, navigate]);

    // Xử lý thanh toán
    const handlePayment = async () => {
        if (!packageData) {
            toast.error("Thông tin gói chưa được tải!");
            return;
        }

        setIsProcessing(true);

        try {
            // Tính tổng tiền (có thể nhân với số chu kỳ nếu là gia hạn)
            const totalAmount = packageData.price * periods;

            // Bước 1: Tạo payment
            const paymentData = {
                customerId: employeeId,
                totalAmount: totalAmount,
                method: paymentMethod,
                status: "PENDING",
                description: isExtend
                    ? `Gia hạn gói ${packageData.name} - ${periods} ${packageData.packageType === "YEARLY" ? "năm" : "tháng"}`
                    : `Thanh toán gói ${packageData.name}`,
                packageId: packageId
            };

            const paymentResponse = await paymentApi.createPaymentPackage(paymentData);

            if (!paymentResponse || !paymentResponse.id) {
                throw new Error("Không thể tạo thanh toán");
            }

            // Lưu thông tin gia hạn vào localStorage để xử lý sau khi thanh toán thành công
            if (isExtend && subscriptionId) {
                localStorage.setItem('extendInfo', JSON.stringify({
                    subscriptionId,
                    extendPeriods: periods,
                    paymentId: paymentResponse.id,
                    isAutoExtend: isAutoExtend || false
                }));
            }

            // Bước 2: Nếu chọn VNPAY, redirect đến trang thanh toán VNPAY
            if (paymentMethod === "VNPAY") {
                const vnpayResponse = await vnpayApi.createVnpay({
                    paymentId: paymentResponse.id,
                    type: "PACKAGE"
                });

                if (vnpayResponse && vnpayResponse.data) {
                    // Redirect đến trang thanh toán VNPAY
                    window.location.href = vnpayResponse.data;
                } else {
                    throw new Error("Không nhận được URL thanh toán VNPAY");
                }
            } else {
                // Xử lý các phương thức thanh toán khác (nếu có)
                toast.error("Phương thức thanh toán chưa được hỗ trợ!");
                setIsProcessing(false);
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error(error.message || "Có lỗi xảy ra khi xử lý thanh toán!");
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Skeleton className="h-12 w-64 mb-8" />
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-96" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-32 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error || !packageData) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-red-500 mb-4">Không thể tải thông tin gói dịch vụ!</p>
                            <Button onClick={() => navigate("/pricing")}>
                                Quay lại trang gói dịch vụ
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(isExtend ? "/driver/my-packages" : "/pricing")}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-800">
                            {isExtend ? "Gia hạn gói dịch vụ" : "Thanh toán gói dịch vụ"}
                        </h1>
                        {isExtend && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                <RefreshCw className="mr-1 h-3 w-3" />
                                Gia hạn
                            </Badge>
                        )}
                        {isAutoExtend && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                Tự động
                            </Badge>
                        )}
                    </div>
                    <p className="text-slate-600 mt-2">
                        Xác nhận thông tin và chọn phương thức thanh toán
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Thông tin gói */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Package Details */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-blue-500" />
                                        Thông tin gói
                                    </CardTitle>
                                    <Badge variant="secondary">
                                        {packageData.packageType === "MONTHLY" ? "Hàng tháng" : "Hàng năm"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-800">
                                        {packageData.name}
                                    </h3>
                                    <p className="text-slate-600 text-sm mt-1">
                                        {packageData.description}
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span className="text-slate-700">
                                            Số lần đổi pin: <strong>{packageData.maxSwapPerMonth}</strong>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-blue-500" />
                                        <span className="text-slate-700">
                                            Thời hạn: <strong>{packageData.durationDays} ngày</strong>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Shield className="h-4 w-4 text-purple-500" />
                                        <span className="text-slate-700">
                                            Trạng thái: <strong>{packageData.status ? "Đang hoạt động" : "Không hoạt động"}</strong>
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-blue-500" />
                                    Phương thức thanh toán
                                </CardTitle>
                                <CardDescription>
                                    Chọn phương thức thanh toán phù hợp
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-slate-50 cursor-pointer">
                                        <RadioGroupItem value="VNPAY" id="vnpay" />
                                        <Label
                                            htmlFor="vnpay"
                                            className="flex items-center gap-3 cursor-pointer flex-1"
                                        >
                                            <CreditCard className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="font-medium text-slate-800">VNPAY</p>
                                                <p className="text-xs text-slate-500">
                                                    Thanh toán qua ví điện tử, thẻ ATM, thẻ quốc tế
                                                </p>
                                            </div>
                                        </Label>
                                    </div>

                                    {/* Có thể thêm phương thức khác */}
                                    <div className="flex items-center space-x-3 border rounded-lg p-4 opacity-50 cursor-not-allowed">
                                        <RadioGroupItem value="MOMO" id="momo" disabled />
                                        <Label
                                            htmlFor="momo"
                                            className="flex items-center gap-3 flex-1"
                                        >
                                            <Wallet className="h-5 w-5 text-pink-600" />
                                            <div>
                                                <p className="font-medium text-slate-800">MoMo</p>
                                                <p className="text-xs text-slate-500">
                                                    Đang cập nhật
                                                </p>
                                            </div>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary */}
                    <div className="md:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>Tổng quan đơn hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Tên gói:</span>
                                        <span className="font-medium">{packageData.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Loại:</span>
                                        <span className="font-medium">
                                            Gói {packageData.packageType === "MONTHLY" ? "Tháng" : "Năm"}
                                        </span>
                                    </div>
                                    {isExtend && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Số chu kỳ:</span>
                                            <span className="font-medium text-blue-600">× {periods}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Giá gói:</span>
                                        <span className="font-medium">{formatCurrency(packageData.price)}</span>
                                    </div>
                                    {isExtend && periods > 1 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">× {periods} chu kỳ:</span>
                                            <span className="font-medium">{formatCurrency(packageData.price * periods)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Phí xử lý:</span>
                                        <span className="font-medium text-green-600">Miễn phí</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-slate-800">Tổng cộng:</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(packageData.price * periods)}
                                    </span>
                                </div>

                                {isExtend && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-xs text-blue-800">
                                            <strong>Lưu ý:</strong> Sau khi thanh toán thành công, gói của bạn sẽ được gia hạn thêm {periods} {packageData.packageType === "YEARLY" ? "năm" : "tháng"} và số lượt đổi pin sẽ được reset về 0.
                                        </p>
                                    </div>
                                )}

                                <Button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    size="lg"
                                >
                                    {isProcessing ? (
                                        <>
                                            <span className="animate-spin mr-2">⏳</span>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Thanh toán ngay
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-center text-slate-500 mt-4">
                                    Bằng cách thanh toán, bạn đồng ý với{" "}
                                    <a href="/terms" className="text-blue-600 hover:underline">
                                        Điều khoản dịch vụ
                                    </a>{" "}
                                    của chúng tôi
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

