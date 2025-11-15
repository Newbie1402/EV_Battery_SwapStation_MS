import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Package, Check, Crown, Home, Info, MapPin, DollarSign, Phone, CheckCircle, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useCustomQuery from "@/hooks/useCustomQuery";
import { packagePlanApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";

export default function PricingPage() {
    const navigate = useNavigate();
    const { token, role } = useAuthStore();
    const isLoggedIn = !!token;

    // Thêm toggle chu kỳ thanh toán
    const [paymentCycle, setPaymentCycle] = useState("MONTHLY");

    // Menu items for public pages
    const publicMenuItems = [
        { label: "Trang chủ", path: "/", icon: Home },
        { label: "Giới thiệu", path: "/about", icon: Info },
        { label: "Trạm đổi pin", path: "/driver/stations", icon: MapPin },
        { label: "Bảng giá", path: "/pricing", icon: DollarSign },
        { label: "Liên hệ", path: "/contact", icon: Phone },
    ];

    // Fetch danh sách package plans (chỉ lấy các gói ACTIVE)
    const { data: plansWrapper, isLoading } = useCustomQuery(
        ["active-package-plans"],
        () => packagePlanApi.getAllPackagePlans()
    );

    const plansData = plansWrapper?.data || plansWrapper || [];
    const allPlans = Array.isArray(plansData) ? plansData : [];

    // Chỉ hiển thị các gói có status ACTIVE và theo chu kỳ đã chọn
    const activePlans = allPlans.filter(
        (plan) => plan.status === "ACTIVE" && plan.packageType === paymentCycle
    );

    // Sắp xếp theo giá từ thấp đến cao
    const sortedPlans = [...activePlans].sort((a, b) => a.price - b.price);

    const handleSubscribe = (plan) => {
        if (!isLoggedIn) {
            toast.error("Vui lòng đăng nhập để đăng ký gói dịch vụ!");
            navigate("/login");
            return;
        }

        if (role !== "DRIVER") {
            toast.error("Chỉ tài xế mới có thể đăng ký gói dịch vụ!");
            return;
        }

        // Chuyển đến trang thanh toán với packageId
        navigate(`/driver/payment-package/${plan.id}`);
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

    // Animation variants
    const fadeVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0 },
    };

    const faqs = [
        {
            q: "Làm thế nào để tính phí cho các gói cước?",
            a: "Phí được tính vào đầu mỗi chu kỳ thanh toán (hàng tháng hoặc hàng năm). Đối với \"Gói Theo Lần\", bạn sẽ thanh toán ngay sau mỗi lần đổi pin. Các khoản phí phát sinh (nếu có) sẽ được cộng vào hóa đơn tiếp theo của bạn."
        },
        {
            q: "Chính sách hủy gói đăng ký như thế nào?",
            a: "Bạn có thể hủy gói đăng ký bất cứ lúc nào. Gói sẽ còn hiệu lực tới hết chu kỳ hiện tại và không tự gia hạn. Không hoàn tiền phần chưa sử dụng."
        },
        {
            q: "Sự khác biệt giữa gói Tiêu chuẩn và gói Pro là gì?",
            a: "Tiêu chuẩn thường giới hạn số lần đổi (ví dụ 20 lần/tháng), còn Pro có thể không giới hạn và kèm đặc quyền như nâng cấp pin miễn phí."
        }
    ];
    const [openFaqIndex, setOpenFaqIndex] = useState(0);
    const toggleFaq = (idx) => {
        setOpenFaqIndex(prev => prev === idx ? null : idx);
    };

    const FAQ_CONTENT_MAX_WIDTH = 720; // px cố định cho phần q và a

    return (
        <div className="w-full min-h-screen bg-[#F8F9FA]">
            {/* Header Component */}
            <Header menuItems={publicMenuItems} role={role || ""} />

            {/* Hero Section với background image */}
            <section
                className="pt-24 pb-14 px-4 sm:px-6 lg:px-8"
            >
                <div
                    className="min-h-[360px] md:min-h-[420px] rounded-lg bg-cover bg-center bg-no-repeat flex flex-col gap-6 items-center justify-center text-center px-4"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(10,37,64,0.7) 0%, rgba(10,37,64,0.9) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAyTwf6NbbX439p9049AstoB_CFob93GqLgJ1bXgTBpblVr7vhr8ipbIhQVZ3cWBQpNmBLirTsaMACKOBOncTd2u6iknOJ271B3RM60ANFupvyYCkoZnsvFfYLHxvPeg9YKg5GyS8Q58FWYzQB9SHaoSRXmXRdAbFVMQkS_tQSyR3WK9I-ynLz1krl-MGIVTr3cufjx8YOC1lOjBE6ivfJuMVOY9tpHtoisJT8bACRsHbbqg76XrPidVnKQINUbm99D2CUklhU4NRQ")',
                    }}
                >
                    <div className="flex flex-col gap-4 max-w-3xl">
                        <h1 className="text-white text-4xl md:text-5xl font-black leading-tight">
                            Bảng Giá Minh Bạch,
                        </h1>
                        <h1 className="text-white text-4xl md:text-5xl font-black leading-tight">
                            Hành Trình Bất Tận
                        </h1>
                        <p className="text-gray-200 text-base md:text-lg">
                            Chọn gói đổi pin phù hợp và trải nghiệm sự tiện lợi. Nhanh chóng, tiết kiệm và luôn sẵn sàng.
                        </p>
                    </div>
                    <Link to="#plans" className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-[#3B82F6] text-white font-bold">
                        Xem Các Gói Cước
                    </Link>
                </div>
            </section>

            {/* Vehicle Pricing Section */}
            <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="mb-12 text-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeVariants}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
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
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.15 }}
                                variants={fadeVariants}
                                transition={{ duration: 0.45, delay: idx * 0.06 }}
                            >
                                <Card className="border-2 border-gray-200 hover:border-blue-500/80 hover:shadow-2xl transition-all h-full">
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
                                                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
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
                        id="plans"
                        className="mb-8 text-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeVariants}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
                            <Crown className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">Gói ưu đãi</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">
                            Các gói dịch vụ đặc biệt
                        </h2>
                        <p className="text-lg text-slate-600 mb-5">
                            Tiết kiệm hơn với các gói đăng ký {paymentCycle === 'MONTHLY' ? 'theo tháng' : 'theo năm'}
                        </p>
                        {/* Toggle Thanh toán theo tháng/năm - moved here */}
                        <div className="flex w-full items-center justify-center">
                            <div className="flex h-10 w-full max-w-md items-center justify-center rounded-lg bg-blue-100/60 p-1">
                                <button
                                    type="button"
                                    onClick={() => setPaymentCycle("MONTHLY")}
                                    className={`flex h-full grow items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium transition-all duration-300 ${
                                        paymentCycle === "MONTHLY"
                                            ? "bg-white text-[#3B82F6] shadow"
                                            : "text-slate-600"
                                    }`}
                                >
                                    Thanh toán theo tháng
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentCycle("YEARLY")}
                                    className={`flex h-full grow items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium transition-all duration-300 ${
                                        paymentCycle === "YEARLY"
                                            ? "bg-white text-[#3B82F6] shadow"
                                            : "text-slate-600"
                                    }`}
                                >
                                    Thanh toán theo năm (Tiết kiệm 20%)
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(3)].map((_, idx) => (
                                <Card key={idx} className="border border-slate-200">
                                    <CardHeader className="space-y-2">
                                        <div className="h-6 bg-slate-200 rounded animate-pulse" />
                                        <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-slate-200 rounded animate-pulse" />
                                            <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : sortedPlans.length === 0 ? (
                        <Card className="border border-slate-200">
                            <CardContent className="p-12 text-center">
                                <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-500 text-lg">
                                    Hiện tại chưa có gói dịch vụ nào
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                            {sortedPlans.map((plan, idx) => {
                                const isPopular = idx === 1;

                                const descParts = (plan.description || "")
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                const firstLine = plan.maxSwapPerMonth
                                    ? `Tối đa ${plan.maxSwapPerMonth} lần đổi/tháng`
                                    : "Không giới hạn lần đổi";

                                return (
                                    <motion.div
                                        key={plan.id}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.15 }}
                                        variants={fadeVariants}
                                        transition={{ duration: 0.45, delay: 0.15 + idx * 0.06 }}
                                    >
                                        <Card
                                            className={`relative overflow-hidden transition-shadow h-full flex flex-col ${
                                                isPopular
                                                    ? "border-2 border-[#3B82F6] shadow-xl"
                                                    : "border border-slate-200 hover:shadow-xl"
                                            }`}
                                        >
                                            {isPopular && (
                                                <p
                                                    className="absolute top-0 right-0 text-white text-xs font-bold tracking-wide bg-[#3B82F6] px-6 py-[6px] transform rotate-45"
                                                    style={{ right: "-28px", top: "10px" }}
                                                >
                                                    Phổ Biến
                                                </p>
                                            )}

                                            <CardContent className="flex-1 flex flex-col items-stretch">
                                                <h3 className="text-center text-2xl font-bold mb-3">{plan.name}</h3>
                                                {/* Giá đơn giản theo mẫu Pricing_new */}
                                                <div className="flex items-baseline gap-1 justify-center mb-6">
                                                    <span
                                                        className="text-4xl font-black leading-tight tracking-tight text-slate-900">
                                                        {formatCurrency(plan.price)}
                                                    </span>
                                                    <span className="text-base font-bold leading-tight text-slate-700">
                                                        / {plan.packageType === "MONTHLY" ? "tháng" : "năm"}
                                                    </span>
                                                </div>

                                                {/* Nút chọn gói */}
                                                <div className="mb-6">
                                                    <Button
                                                        onClick={() => handleSubscribe(plan)}
                                                        className={`w-full h-10 text-sm font-bold ${
                                                            isPopular
                                                                ? "bg-[#3B82F6] text-white hover:bg-[#2563EB]"
                                                                : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                                                        }`}
                                                    >
                                                        {isLoggedIn ? "Đăng ký gói" : "Đăng nhập để đăng ký"}
                                                    </Button>
                                                </div>

                                                {/* Danh sách tính năng */}
                                                <div className="flex flex-col gap-2.5">
                                                    {[firstLine, ...descParts].map((line, i) => (
                                                        <div key={i}
                                                             className="text-[13px] font-normal leading-normal flex gap-3 items-center">
                                                            <CheckCircle className="w-4 h-4 text-[#3B82F6]"/>
                                                            <span className="text-slate-700">{line}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* FAQ Section */}
            <motion.section
                className="flex flex-col gap-6 px-4 py-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeVariants}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-2xl font-bold leading-tight tracking-tight text-center text-slate-900">Các câu hỏi thường gặp</h2>
                <div className="space-y-4 max-w-3xl mx-auto">
                    {faqs.map((item, idx) => {
                        const isOpen = openFaqIndex === idx;
                        return (
                            <div
                                key={idx}
                                className={`rounded-lg border border-slate-200 bg-white transition-shadow ${isOpen ? 'shadow-md' : ''}`}
                            >
                                <div className="mx-auto w-full" style={{ maxWidth: FAQ_CONTENT_MAX_WIDTH }}>
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left select-none"
                                        style={{ width: '100%' }}
                                    >
                                        <span className="text-base font-medium text-slate-900 pr-4 w-full">
                                            {item.q}
                                        </span>
                                        <motion.span
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="flex items-center justify-center flex-shrink-0"
                                            style={{ width: 24 }}
                                        >
                                            <ChevronDown className="w-5 h-5 text-slate-500" />
                                        </motion.span>
                                    </button>
                                    <AnimatePresence initial={false} mode="wait">
                                        {isOpen && (
                                            <motion.div
                                                key="content"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.35, ease: 'easeInOut' }}
                                                className="px-4 pb-4 overflow-hidden"
                                                style={{ width: '100%' }}
                                            >
                                                <p className="text-sm leading-relaxed text-slate-700 m-0">
                                                    {item.a}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.section>

            {/* Footer Component */}
            <Footer />
        </div>
    );
}
