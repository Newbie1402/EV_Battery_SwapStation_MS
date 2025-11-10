import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/authApi";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return false;
        }

        if (formData.password.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
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
            const response = await authApi.register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            });

            // Save to Zustand store
            login({
                userId: response.userId,
                token: response.token,
                role: response.role,
            });

            toast.success(`Đăng ký thành công! Chào mừng ${response.name}!`);

            // Redirect to driver home (default role)
            navigate("/driver/home");
        } catch (error) {
            toast.error(error.message || "Đăng ký thất bại!");
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
                                Đăng ký tài khoản
                            </CardTitle>
                            <CardDescription className="text-gray-600 mt-2">
                                Tham gia cùng hàng ngàn tài xế EV Battery Swap
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700">
                                    Họ và tên <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Nguyễn Văn A"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="pl-10 h-11"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700">
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-10 h-11"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Phone Field */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-gray-700">
                                    Số điện thoại <span className="text-red-500">*</span>
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

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700">
                                    Mật khẩu <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
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
                                <p className="text-xs text-gray-500">Tối thiểu 6 ký tự</p>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-gray-700">
                                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="pl-10 pr-10 h-11"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Terms and Conditions */}
                            <div className="flex items-start gap-2">
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
                                        Đăng ký
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>
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
                </Card>
            </motion.div>
        </div>
    );
}