import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/authApi";
import toast from "react-hot-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleGoogleLogin = async (credentialResponse) => {
        setIsLoading(true);

        try {
            const idToken = credentialResponse.credential;
            const response = await authApi.loginWithGoogle(idToken);

            // Kiểm tra response structure
            const userData = response.data || response;

            // Save to Zustand store - lưu cả userId và employeeId
            login({
                userId: userData.user.id,
                employeeId: userData.user.employeeId || null,
                token: userData.accessToken,
                refreshToken: userData.refreshToken,
                role: userData.user.role,
                stationId: userData.user.stationId || null,
                status: userData.user.status,
                user: userData.user, // Lưu toàn bộ thông tin user
            });

            toast.success(`Chào mừng ${userData.user.fullName}!`);

            // Kiểm tra status để redirect hoặc yêu cầu verify
            if (userData.user.status === "PENDING_VERIFICATION") {
                toast.error("Vui lòng xác thực email để tiếp tục!");
                navigate("/verify-otp", { state: { email: userData.user.email } });
                return;
            }

            // Redirect based on role
            switch (userData.user.role) {
                case "ADMIN":
                    navigate("/admin/dashboard");
                    break;
                case "STAFF":
                    navigate("/staff/dashboard");
                    break;
                case "DRIVER":
                    navigate("/driver/dashboard");
                    break;
                default:
                    navigate("/");
            }
        } catch (error) {
            // Xử lý lỗi 404 - tài khoản chưa đăng ký
            if (error.statusCode === 404) {
                toast.error("Tài khoản Google chưa được đăng ký. Vui lòng đăng ký trước!");
                navigate("/register");
            } else {
                toast.error(error.data || error.message || "Đăng nhập thất bại!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = (error) => {
        console.error("Google Login Error:", error);

        // Xử lý các lỗi phổ biến
        if (error?.error === "popup_closed_by_user") {
            toast.error("Bạn đã đóng cửa sổ đăng nhập!");
        } else if (error?.error === "access_denied") {
            toast.error("Bạn đã từ chối quyền truy cập!");
        } else {
            toast.error("Đăng nhập Google thất bại! Vui lòng thử lại.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="w-full max-w-md relative z-10">
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
                                Đăng nhập
                            </CardTitle>
                            <CardDescription className="text-gray-600 mt-2">
                                Chào mừng bạn trở lại với EV Battery Swap
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-4">
                            {/* Google Login Button */}
                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleLogin}
                                    onError={handleGoogleError}
                                    text="signin_with"
                                    shape="rectangular"
                                    theme="outline"
                                    size="large"
                                    width="350"
                                    auto_select={false}
                                />
                            </div>

                            {isLoading && (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                                    <span className="ml-2 text-sm text-gray-600">Đang xử lý...</span>
                                </div>
                            )}

                            {/* Info Box */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs font-semibold text-blue-900 mb-2">ℹ️ Lưu ý:</p>
                                <div className="space-y-1 text-xs text-blue-700">
                                    <p>• Chỉ hỗ trợ đăng nhập bằng tài khoản Google</p>
                                    <p>• Nếu chưa có tài khoản, vui lòng đăng ký trước</p>
                                    <p>• Sau khi đăng ký, cần xác thực email qua OTP</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>

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

                        {/* Register Link */}
                        <p className="text-center text-sm text-gray-600">
                            Chưa có tài khoản?{" "}
                            <Link
                                to="/register"
                                className="text-emerald-600 hover:text-emerald-700 font-semibold transition"
                            >
                                Đăng ký ngay
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
                </Card>
            </div>
        </div>
    );
}