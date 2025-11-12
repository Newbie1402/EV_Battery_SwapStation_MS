import { motion } from "framer-motion";
import { Battery, Zap, Leaf, Clock, Shield, TrendingUp, MapPin, Users, Sparkles, Home, Info, DollarSign, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const { token, role } = useAuthStore();
    const navigate = useNavigate();

    const fadeVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
    };

    const floatVariants = {
        animate: {
            y: [0, -20, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    // Menu items for public homepage
    const publicMenuItems = [
        { label: "Trang chủ", path: "/", icon: Home },
        { label: "Giới thiệu", path: "/about", icon: Info },
        { label: "Trạm đổi pin", path: "/driver/stations", icon: MapPin },
        { label: "Bảng giá", path: "/pricing", icon: DollarSign },
        { label: "Liên hệ", path: "/contact", icon: Phone },
    ];

    // Handle CTA button click
    const handleGetStarted = () => {
        if (token) {
            // If logged in, redirect based on role
            switch (role) {
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
        } else {
            // If not logged in, redirect to register
            navigate("/register");
        }
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50 text-gray-900 overflow-x-hidden">
            {/* Header Component */}
            <Header menuItems={publicMenuItems} role={role || ""} />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
                    <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-500" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700">Công nghệ tương lai</span>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                Đổi Pin Nhanh
                            </span>
                            <br />
                            <span className="text-gray-800">Tương Lai Xanh</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-xl mb-8 leading-relaxed">
                            Hệ thống quản lý trạm đổi pin thông minh cho xe điện.
                            Đổi pin chỉ trong 3 phút, tiếp tục hành trình xanh của bạn.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={handleGetStarted}
                                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                            >
                                Bắt đầu ngay
                                <Zap className="w-5 h-5" />
                            </button>
                            <button
                                onClick ={() => navigate("/about")}
                                className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all border-2 border-gray-200">
                                Tìm hiểu thêm
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 mt-12">
                            {[
                                { value: "500+", label: "Trạm đổi pin" },
                                { value: "50K+", label: "Người dùng" },
                                { value: "3 phút", label: "Thời gian đổi" },
                            ].map((stat, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="text-3xl font-bold text-emerald-600">{stat.value}</div>
                                    <div className="text-sm text-gray-600">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Hero Illustration */}
                    <motion.div
                        className="relative"
                        variants={floatVariants}
                        animate="animate"
                    >
                        <div className="relative w-full h-[500px] flex items-center justify-center">
                            {/* Large Battery Icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-64 h-80 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                                    <Battery className="w-32 h-32 text-white relative z-10" strokeWidth={1.5} />
                                    <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-emerald-600 to-transparent" />
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <motion.div
                                className="absolute top-10 right-10 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Zap className="w-10 h-10 text-yellow-500" />
                            </motion.div>

                            <motion.div
                                className="absolute bottom-20 left-0 w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center"
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                            >
                                <Leaf className="w-12 h-12 text-emerald-500" />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6 md:px-12 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        variants={fadeVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h3 className="text-4xl font-bold mb-4 text-gray-800">
                            Tại sao chọn chúng tôi?
                        </h3>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Giải pháp đổi pin thông minh, tiện lợi và thân thiện với môi trường
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Quản lý thông minh",
                                desc: "Theo dõi hiệu suất pin và vận hành trạm với phân tích dữ liệu thông minh.",
                                icon: TrendingUp,
                                color: "from-blue-500 to-cyan-500",
                                bgColor: "bg-blue-50"
                            },
                            {
                                title: "Đổi pin nhanh chóng",
                                desc: "Thay thế pin hết với pin đầy chỉ trong vài giây, tiện lợi như đổ xăng.",
                                icon: Clock,
                                color: "from-emerald-500 to-green-500",
                                bgColor: "bg-emerald-50"
                            },
                            {
                                title: "An toàn tuyệt đối",
                                desc: "Hệ thống bảo mật và kiểm tra chất lượng pin tự động trước mỗi giao dịch.",
                                icon: Shield,
                                color: "from-purple-500 to-pink-500",
                                bgColor: "bg-purple-50"
                            },
                            {
                                title: "Thân thiện môi trường",
                                desc: "Giảm thiểu khí thải carbon và thúc đẩy giao thông bền vững.",
                                icon: Leaf,
                                color: "from-green-500 to-emerald-500",
                                bgColor: "bg-green-50"
                            },
                            {
                                title: "Mạng lưới rộng khắp",
                                desc: "Hơn 500 trạm đổi pin trên toàn quốc, luôn sẵn sàng phục vụ.",
                                icon: MapPin,
                                color: "from-orange-500 to-red-500",
                                bgColor: "bg-orange-50"
                            },
                            {
                                title: "Cộng đồng lớn mạnh",
                                desc: "Tham gia cùng hơn 50,000 tài xế đang sử dụng dịch vụ của chúng tôi.",
                                icon: Users,
                                color: "from-indigo-500 to-purple-500",
                                bgColor: "bg-indigo-50"
                            },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                className={`${item.bgColor} rounded-3xl p-8 hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100`}
                                variants={fadeVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}>
                                    <item.icon className="w-8 h-8 text-white" strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-800">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 md:px-12 bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>

                <motion.div
                    className="max-w-4xl mx-auto text-center relative z-10"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Sẵn sàng chuyển đổi sang năng lượng xanh?
                    </h2>
                    <p className="text-xl text-white/90 mb-10 leading-relaxed">
                        Tham gia cùng hàng ngàn tài xế đang trải nghiệm tương lai của giao thông bền vững
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button
                            onClick={handleGetStarted}
                            className="px-10 py-4 bg-white text-emerald-600 rounded-full font-bold hover:shadow-2xl hover:scale-105 transition-all text-lg"
                        >
                            Đăng ký ngay
                        </button>
                        <button className="px-10 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-bold hover:bg-white/30 transition-all text-lg border-2 border-white/50">
                            Xem demo
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Footer Component */}
            <Footer />
        </div>
    );
}