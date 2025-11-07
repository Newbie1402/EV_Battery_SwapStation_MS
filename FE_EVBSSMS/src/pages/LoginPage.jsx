import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/authApi";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // Validation
        if (!email || !password) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.login(email, password);

            // Save to Zustand store
            login({
                userId: response.userId,
                token: response.token,
                role: response.role,
            });

            toast.success(`Chào mừng ${response.name}!`);

            // Redirect based on role
            switch (response.role) {
                case "ADMIN":
                    navigate("/admin/dashboard");
                    break;
                case "STAFF":
                    navigate("/staff/dashboard");
                    break;
                case "DRIVER":
                    navigate("/driver/home");
                    break;
                default:
                    navigate("/");
            }
        } catch (error) {
            toast.error(error.message || "Đăng nhập thất bại!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
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
                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700">
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@evbss.vn"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-11"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700">
                                    Mật khẩu
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 h-11"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password Link */}
                            <div className="flex justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            {/* Login Button */}
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
                                        Đăng nhập
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Demo Accounts Info */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs font-semibold text-blue-900 mb-2">🔐 Tài khoản demo:</p>
                            <div className="space-y-1 text-xs text-blue-700">
                                <p><strong>Admin:</strong> admin@evbss.vn / admin123</p>
                                <p><strong>Staff:</strong> staff@evbss.vn / staff123</p>
                                <p><strong>Driver:</strong> driver@evbss.vn / driver123</p>
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
            </motion.div>
        </div>
    );
}