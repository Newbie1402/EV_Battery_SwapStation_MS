import { motion } from "framer-motion";
import { Package, Check, Zap, Calendar, Users, ArrowRight, LogIn, Crown, Star, Home, Info, MapPin, DollarSign, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useCustomQuery from "@/hooks/useCustomQuery";
import { packagePlanApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/format";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";

export default function PricingPage() {
    const navigate = useNavigate();
    const { token, role } = useAuthStore();
    const isLoggedIn = !!token;

    // Menu items for public pages
    const publicMenuItems = [
        { label: "Trang chủ", path: "/", icon: Home },
        { label: "Giới thiệu", path: "/about", icon: Info },
        { label: "Trạm đổi pin", path: "/driver/stations", icon: MapPin },
        { label: "Bảng giá", path: "/pricing", icon: DollarSign },
        { label: "Liên hệ", path: "/contact", icon: Phone },
    ];

    const fadeVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
    };

    // Fetch danh sách package plans (chỉ lấy các gói ACTIVE)
    const { data: plansWrapper, isLoading } = useCustomQuery(
        ["active-package-plans"],
        () => packagePlanApi.getAllPackagePlans()
    );

    const plansData = plansWrapper?.data || plansWrapper || [];
    const allPlans = Array.isArray(plansData) ? plansData : [];

    // Chỉ hiển thị các gói có status ACTIVE
    const activePlans = allPlans.filter(plan => plan.status === "ACTIVE");

    // Sắp xếp theo giá từ thấp đến cao
    const sortedPlans = [...activePlans].sort((a, b) => a.price - b.price);

    const handleSubscribe = (plan) => {
        if (!isLoggedIn) {
            toast.error("Vui lòng đăng nhập để đăng ký gói dịch vụ!");
            navigate("/login");
            return;
        }

        // TODO: Implement subscription logic
        toast.success(`Đang xử lý đăng ký gói ${plan.name}...`);
        console.log("Subscribe to plan:", plan);
    };

    // Pricing tiers theo loại phương tiện (static data - có thể fetch từ API sau)
    const vehiclePricing = [
        {
            type: "Xe máy điện",
            image: "/xemaydien.jpg",
            basePrice: 5000,
            perSwapPrice: 15000,
            features: [
                "Đổi pin nhanh chóng trong 3 phút",
                "Pin chất lượng cao, bảo hành 1 năm",
                "Hỗ trợ 24/7",
                "Mạng lưới trạm rộng khắp"
            ]
        },
        {
            type: "Xe ô tô điện",
            image: "/otodien.png",
            basePrice: 10000,
            perSwapPrice: 50000,
            features: [
                "Đổi pin nhanh trong 5-10 phút",
                "Pin công nghệ cao, bảo hành 2 năm",
                "Hỗ trợ ưu tiên 24/7",
                "Mạng lưới trạm cao cấp"
            ]
        }
    ];

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
            {/* Header Component */}
            <Header menuItems={publicMenuItems} role={role || ""} />

            {/* Hero Section */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeVariants}
                transition={{ duration: 0.8 }}
                className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-center"
            >
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-full mb-6">
                        <Star className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">Bảng giá dịch vụ</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                            Chọn gói phù hợp
                        </span>
                        <br />
                        <span className="text-gray-900">cho phương tiện của bạn</span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Trải nghiệm dịch vụ đổi pin nhanh chóng, tiện lợi với mức giá hợp lý.
                        Đăng ký gói ưu đãi ngay hôm nay!
                    </p>
                </div>
            </motion.div>

            {/* Vehicle Pricing Section */}
            <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeVariants}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mb-12 text-center"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Bảng giá theo loại phương tiện
                        </h2>
                        <p className="text-lg text-gray-600">
                            Chi phí linh hoạt phù hợp với từng loại xe
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                        {vehiclePricing.map((vehicle, idx) => (
                            <motion.div
                                key={vehicle.type}
                                initial="hidden"
                                animate="visible"
                                variants={fadeVariants}
                                transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                            >
                                <Card className="border-2 border-gray-200 hover:border-emerald-500 hover:shadow-2xl transition-all h-full">
                                    <CardHeader className="text-center pb-8">
                                        <div className="flex justify-center mb-4">
                                            <img
                                                src={vehicle.image}
                                                alt={vehicle.type}
                                                className="w-32 h-32 object-contain rounded-lg"
                                            />
                                        </div>
                                        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                                            {vehicle.type}
                                        </CardTitle>
                                        <CardDescription className="text-lg">
                                            Chi phí linh hoạt theo nhu cầu sử dụng
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6 mb-8">
                                            <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl p-6">
                                                <div className="text-sm text-gray-600 mb-2">Phí cơ bản/tháng</div>
                                                <div className="text-4xl font-bold text-emerald-700">
                                                    {formatCurrency(vehicle.basePrice)}
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
                                                <div className="text-sm text-gray-600 mb-2">Chi phí mỗi lần đổi pin</div>
                                                <div className="text-4xl font-bold text-blue-700">
                                                    {formatCurrency(vehicle.perSwapPrice)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-8">
                                            <h4 className="font-semibold text-gray-900">Ưu điểm:</h4>
                                            {vehicle.features.map((feature, index) => (
                                                <div key={index} className="flex items-start gap-3">
                                                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-gray-700">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Package Plans Section */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeVariants}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="mb-12 text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full mb-6">
                            <Crown className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-700">Gói ưu đãi</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Các gói dịch vụ đặc biệt
                        </h2>
                        <p className="text-lg text-gray-600">
                            Tiết kiệm hơn với các gói đăng ký theo tháng
                        </p>
                    </motion.div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(3)].map((_, idx) => (
                                <Card key={idx} className="border border-gray-200">
                                    <CardHeader className="space-y-2">
                                        <div className="h-6 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : sortedPlans.length === 0 ? (
                        <Card className="border border-gray-200">
                            <CardContent className="p-12 text-center">
                                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500 text-lg">
                                    Hiện tại chưa có gói dịch vụ nào
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {sortedPlans.map((plan, idx) => {
                                const isPopular = idx === 1; // Gói giữa là popular
                                const isPremium = idx === sortedPlans.length - 1; // Gói cuối là premium

                                return (
                                    <motion.div
                                        key={plan.id}
                                        initial="hidden"
                                        animate="visible"
                                        variants={fadeVariants}
                                        transition={{ duration: 0.6, delay: 0.6 + idx * 0.1 }}
                                    >
                                        <Card className={`border-2 hover:shadow-2xl transition-all h-full flex flex-col relative ${
                                            isPopular 
                                                ? "border-emerald-500 shadow-xl scale-105" 
                                                : "border-gray-200"
                                        }`}>
                                            {isPopular && (
                                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                                    <Badge className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-4 py-1">
                                                        <Star className="w-3 h-3 mr-1" />
                                                        Phổ biến nhất
                                                    </Badge>
                                                </div>
                                            )}
                                            {isPremium && (
                                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                                    <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-1">
                                                        <Crown className="w-3 h-3 mr-1" />
                                                        Cao cấp
                                                    </Badge>
                                                </div>
                                            )}

                                            <CardHeader className="text-center pb-8">
                                                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                                                    {plan.name}
                                                </CardTitle>
                                                <CardDescription className="text-base min-h-[48px]">
                                                    {plan.description || "Gói dịch vụ tiết kiệm và tiện lợi"}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent className="flex-1 flex flex-col">
                                                <div className={`rounded-2xl p-8 mb-8 text-center ${
                                                    isPopular 
                                                        ? "bg-gradient-to-br from-emerald-500 to-cyan-500" 
                                                        : "bg-gradient-to-br from-gray-100 to-gray-200"
                                                }`}>
                                                    <div className={`text-5xl font-extrabold mb-2 ${
                                                        isPopular ? "text-white" : "text-gray-900"
                                                    }`}>
                                                        {formatCurrency(plan.price)}
                                                    </div>
                                                    <div className={`text-sm ${
                                                        isPopular ? "text-emerald-50" : "text-gray-600"
                                                    }`}>
                                                        /{plan.packageType === "MONTHLY" ? "tháng" : "năm"}
                                                    </div>
                                                </div>

                                                <div className="space-y-4 mb-8 flex-1">
                                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                                        <Zap className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                        <div>
                                                            <span className="font-semibold text-gray-900">{plan.maxSwapPerMonth}</span>
                                                            <span className="text-gray-600 text-sm ml-1">lần đổi/tháng</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                                                        <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                                        <div>
                                                            <span className="font-semibold text-gray-900">
                                                                {plan.packageType === "MONTHLY" ? "Theo tháng" : "Theo năm"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                                                        <Users className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                                        <span className="text-gray-600 text-sm">
                                                            Phù hợp cho người dùng cá nhân
                                                        </span>
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => handleSubscribe(plan)}
                                                    className={`w-full h-12 text-base font-semibold ${
                                                        isPopular
                                                            ? "bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg"
                                                            : "bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {isLoggedIn ? (
                                                        <>
                                                            Đăng ký ngay
                                                            <ArrowRight className="w-5 h-5 ml-2" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <LogIn className="w-5 h-5 mr-2" />
                                                            Đăng nhập để đăng ký
                                                        </>
                                                    )}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* CTA Section */}
                    {!isLoggedIn && (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeVariants}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="mt-16 text-center"
                        >
                            <Card className="border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-cyan-50">
                                <CardContent className="p-12">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                        Bạn chưa có tài khoản?
                                    </h3>
                                    <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                                        Đăng ký ngay để trải nghiệm dịch vụ đổi pin nhanh chóng và nhận ưu đãi hấp dẫn!
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <Link to="/login">
                                            <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-8 py-6 text-lg">
                                                <LogIn className="w-5 h-5 mr-2" />
                                                Đăng nhập
                                            </Button>
                                        </Link>
                                        <Link to="/register">
                                            <Button variant="outline" className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg">
                                                Đăng ký tài khoản
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Footer Component */}
            <Footer />
        </div>
    );
}
