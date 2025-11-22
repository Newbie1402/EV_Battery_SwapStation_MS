import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Phone, Calendar, MapPin, CreditCard, ArrowRight, Loader2 } from "lucide-react";
import { authApi } from "@/api/authApi";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
    const [step, setStep] = useState(1); // 1: Google Login, 2: Fill Info
    const [idToken, setIdToken] = useState(null);
    const [googleUserInfo, setGoogleUserInfo] = useState(null);
    const [hasRegistered, setHasRegistered] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");

    const [formData, setFormData] = useState({
        phone: "",
        birthday: "",
        address: "",
        identityCard: "",
        // Vehicle info (optional for DRIVER role)
        vin: "",
        model: "",
        licensePlate: "",
        batteryType: "",
        batteryCapacity: "",
        vehicleNotes: "",
    });

    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDriver, setIsDriver] = useState(true); // Default role is DRIVER

    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);

        try {
            const token = credentialResponse.credential;
            setIdToken(token);

            // Decode JWT to get user info (optional, for display)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const userInfo = JSON.parse(jsonPayload);
            setGoogleUserInfo(userInfo);

            // Move to step 2
            setStep(2);
            toast.success("Đăng nhập Google thành công! Vui lòng điền thông tin bổ sung.");
        } catch (error) {
            toast.error("Không thể xử lý thông tin Google!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = (error) => {
        console.error("Google Register Error:", error);

        // Xử lý các lỗi phổ biến
        if (error?.error === "popup_closed_by_user") {
            toast.error("Bạn đã đóng cửa sổ đăng ký!");
        } else if (error?.error === "access_denied") {
            toast.error("Bạn đã từ chối quyền truy cập!");
        } else {
            toast.error("Đăng ký Google thất bại! Vui lòng thử lại.");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        // Yêu cầu: phải có CCCD/CMND và đồng ý điều khoản
        if (!formData.identityCard?.trim()) {
            toast.error("Vui lòng nhập CCCD/CMND!");
            return false;
        }
        if (!agreeToTerms) {
            toast.error("Vui lòng đồng ý với điều khoản sử dụng!");
            return false;
        }
        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Chỉ gửi các trường người dùng đã nhập; phần còn thiếu sẽ bổ sung sau
            const registerData = {
                idToken: idToken,
                role: isDriver ? "DRIVER" : "STAFF",
                identityCard: formData.identityCard.trim(),
            };
            if (formData.phone) registerData.phone = formData.phone;
            if (formData.birthday) registerData.birthday = formData.birthday;
            if (formData.address) registerData.address = formData.address;

            if (isDriver && formData.vin && formData.licensePlate) {
                registerData.vehicles = [
                    {
                        vin: formData.vin,
                        model: formData.model || null,
                        licensePlate: formData.licensePlate,
                        batteryType: formData.batteryType || null,
                        batteryCapacity: formData.batteryCapacity ? parseFloat(formData.batteryCapacity) : null,
                        notes: formData.vehicleNotes || null,
                    }
                ];
            }

            const response = await authApi.registerWithGoogle(registerData);

            // Kiểm tra response structure
            const userData = response.data || response;

            // Save to Zustand store - lưu cả userId và employeeId
            // login({
            //     userId: userData.user.id,
            //     employeeId: userData.user.employeeId || null,
            //     token: userData.accessToken,
            //     refreshToken: userData.refreshToken,
            //     role: userData.user.role,
            //     stationId: userData.user.stationId || null,
            //     status: userData.user.status,
            //     user: userData.user,
            // });

            toast.success(`Đăng ký thành công! Chào mừng ${userData.user.fullName}! Vui lòng chờ admin phê duyệt.`);
            toast.success("Sau khi được duyệt, kiểm tra email để nhận token xác nhận đăng ký.");

            // Hiển thị màn hình chúc mừng + hướng dẫn chờ email xác nhận
            setHasRegistered(true);
            setRegisteredEmail(userData.user.email || googleUserInfo?.email || "");
        } catch (error) {
            if (error.statusCode === 409) {
                toast.error("Email này đã được đăng ký. Vui lòng đăng nhập!");
                navigate("/login");
            } else {
                console.error("Register error", error);
                toast.error(error.data || error.message || "Đăng ký thất bại!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4 py-12">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-300/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="w-full max-w-2xl relative z-10">
                <Card className="shadow-2xl border-0">
                    <CardHeader className="space-y-4 pb-6">
                        {/* Logo */}
                        <Link to="/" className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg">
                                <Zap className="w-7 h-7 text-white" />
                            </div>
                        </Link>

                        <div className="text-center">
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                {hasRegistered ? "Đăng ký thành công" : "Đăng ký tài khoản"}
                            </CardTitle>
                            <CardDescription className="text-gray-600 mt-2">
                                {hasRegistered
                                    ? "Tài khoản đang chờ Admin phê duyệt. Vui lòng kiểm tra email để xác nhận sau khi được duyệt."
                                    : step === 1 ? "Bước 1: Đăng nhập bằng Google" : "Bước 2: Hoàn thiện thông tin"}
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {hasRegistered ? (
                            <div className="space-y-4 text-center">
                                <div className="mx-auto w-full p-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900">
                                    <p className="text-lg font-semibold">Chúc mừng bạn đã đăng ký thành công! 🎉</p>
                                    <p className="text-sm mt-1">Tài khoản của bạn hiện đang chờ Admin phê duyệt.</p>
                                </div>
                                <div className="mx-auto w-full p-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-900">
                                    <p className="text-sm">Sau khi được duyệt, hệ thống sẽ gửi email chứa token xác nhận.</p>
                                    {registeredEmail && (
                                        <p className="text-sm mt-1">Email: <span className="font-medium">{registeredEmail}</span></p>
                                    )}
                                    <p className="text-sm mt-1">Bạn có thể nhập token tại trang Xác nhận đăng ký khi nhận được email.</p>
                                </div>
                                <div className="flex gap-2 justify-center">
                                    <Link to="/">
                                        <Button variant="outline" className="cursor-pointer">Về trang chủ</Button>
                                    </Link>
                                    <Link to="/verify-registration">
                                        <Button className="cursor-pointer">Tới trang xác nhận</Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                {step === 1 ? (
                                    // Step 1: Google Login
                                    <div className="space-y-4">
                                        <div className="flex justify-center">
                                            <GoogleLogin
                                                onSuccess={handleGoogleSuccess}
                                                onError={handleGoogleError}
                                                text="signup_with"
                                                shape="rectangular"
                                                theme="outline"
                                                size="large"
                                                width="350"
                                            />
                                        </div>

                                        {isLoading && (
                                            <div className="flex items-center justify-center py-4">
                                                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                                                <span className="ml-2 text-sm text-gray-600">Đang xử lý...</span>
                                            </div>
                                        )}

                                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-xs font-semibold text-blue-900 mb-2">ℹ️ Lưu ý:</p>
                                            <div className="space-y-1 text-xs text-blue-700">
                                                <p>• Sử dụng tài khoản Google để đăng ký nhanh chóng (tự động điền các thông tin có sẵn)</p>
                                                <p>• Các trường còn thiếu bạn có thể bổ sung sau trong trang Hồ sơ</p>
                                                <p>• Yêu cầu tối thiểu: CCCD/CMND</p>
                                                <p>• Sau khi đăng ký: Admin phê duyệt → Email gửi token → Xác nhận tại trang Xác nhận đăng ký</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Step 2: Fill Additional Info (một số trường không bắt buộc)
                                    <form onSubmit={handleRegister} className="space-y-4">
                                        {/* Google User Info Display */}
                                        {googleUserInfo && (
                                            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                                <p className="text-sm text-emerald-900">
                                                    <strong>Email:</strong> {googleUserInfo.email}
                                                </p>
                                                <p className="text-sm text-emerald-900">
                                                    <strong>Tên:</strong> {googleUserInfo.name}
                                                </p>
                                            </div>
                                        )}

                                        {/* Role Selection */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Vai trò đăng ký</Label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={isDriver}
                                                        onChange={() => setIsDriver(true)}
                                                        className="w-4 h-4 text-emerald-600"
                                                    />
                                                    <span className="text-sm">Tài xế (Driver)</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={!isDriver}
                                                        onChange={() => setIsDriver(false)}
                                                        className="w-4 h-4 text-emerald-600"
                                                    />
                                                    <span className="text-sm">Nhân viên (Staff)</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Grid Layout for Form Fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Phone */}
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-gray-700">
                                                    Số điện thoại
                                                </Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        type="tel"
                                                        placeholder="0987654321"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        className="pl-10 h-11"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </div>

                                            {/* Birthday */}
                                            <div className="space-y-2">
                                                <Label htmlFor="birthday" className="text-gray-700">
                                                    Ngày sinh
                                                </Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        id="birthday"
                                                        name="birthday"
                                                        type="date"
                                                        value={formData.birthday}
                                                        onChange={handleChange}
                                                        className="pl-10 h-11"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </div>

                                            {/* Identity Card */}
                                            <div className="space-y-2">
                                                <Label htmlFor="identityCard" className="text-gray-700">
                                                    CCCD/CMND <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        id="identityCard"
                                                        name="identityCard"
                                                        type="text"
                                                        placeholder="001234567890"
                                                        value={formData.identityCard}
                                                        onChange={handleChange}
                                                        className="pl-10 h-11"
                                                        disabled={isLoading}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Address */}
                                            <div className="space-y-2">
                                                <Label htmlFor="address" className="text-gray-700">
                                                    Địa chỉ
                                                </Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        id="address"
                                                        name="address"
                                                        type="text"
                                                        placeholder="Nhập địa chỉ"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        className="pl-10 h-11"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Terms and Conditions */}
                                        <div className="flex items-start gap-2 pt-4">
                                            <Checkbox
                                                id="terms"
                                                checked={agreeToTerms}
                                                onCheckedChange={setAgreeToTerms}
                                                disabled={isLoading}
                                                className="mt-1"
                                            />
                                            <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                                                Tôi đồng ý với{" "}
                                                <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium">
                                                    Điều khoản sử dụng
                                                </Link>{" "}
                                                và{" "}
                                                <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium">
                                                    Chính sách bảo mật
                                                </Link>
                                            </Label>
                                        </div>

                                        {/* Register Button */}
                                        <Button
                                            type="submit"
                                            className="w-full h-11 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    Hoàn tất đăng ký
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </>
                        )}
                    </CardContent>

                    {!hasRegistered && (
                        <CardFooter className="flex flex-col space-y-4">
                            {/* Divider */}
                            <div className="relative w-full">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">hoặc</span>
                                </div>
                            </div>

                            {/* Login Link */}
                            <p className="text-center text-sm text-gray-600">
                                Đã có tài khoản?{" "}
                                <Link
                                    to="/login"
                                    className="text-emerald-600 hover:text-emerald-700 font-semibold transition"
                                >
                                    Đăng nhập ngay
                                </Link>
                            </p>

                            {/* Back to Home */}
                            <Link
                                to="/"
                                className="text-center text-sm text-gray-500 hover:text-gray-700 transition"
                            >
                                ← Quay lại trang chủ
                            </Link>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
}