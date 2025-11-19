// eslint-disable-next-line no-unused-vars
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
        <div className="w-full min-h-screen bg-slate-50 text-gray-900 overflow-x-hidden">
            {/* Header Component */}
            <Header menuItems={publicMenuItems} role={role || ""} />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 bg-cover bg-center" style={{backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBU_I5KTZSR1X1PVyCNYONUnFcRMpuUxVafMp5VA0oP-BSXxO109ptJkiA2XCyAg8qKQi8cYxIsFy6dBKY6kt4OHFDE9QbFVPDDH5_jD-5bCNl5B_hwGqz0KLWft1SW4JYr0hIG7A6pq0EJZZNBL89S7nAWUTF_hSFLQOzKIVkDzZ1YIYgNixZoQhrW5sKbPE2aHK5g4BDwSz9SAvLURy-19rNdiv-7NiEdxGZ3X6JPdZ5lvERes1jJ1tgQWyNUXK-PFt7nWOQ8yH4")'}}>
                {/* Animated Background Elements - removed */}

                <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#135bec]/20 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-white" />
                            <span className="text-sm font-medium text-white">Công nghệ tương lai</span>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-white">
                            Đổi Pin Nhanh
                            <br />
                            Tương Lai Xanh
                        </h2>
                        <p className="text-lg text-slate-200 max-w-xl mb-8 leading-relaxed">
                            Hệ thống quản lý trạm đổi pin thông minh cho xe điện.
                            Đổi pin chỉ trong 3 phút, tiếp tục hành trình xanh của bạn.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={handleGetStarted}
                                className="px-8 py-4 bg-[#135bec] text-white rounded-lg font-semibold hover:bg-[#135bec]/90 hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                            >
                                Bắt đầu ngay
                                <Zap className="w-5 h-5" />
                            </button>
                            <button
                                onClick ={() => navigate("/about")}
                                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 hover:shadow-lg hover:scale-105 transition-all border-2 border-white/50">
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
                                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                                    <div className="text-sm text-slate-200">{stat.label}</div>
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
                                <div className="w-64 h-80 bg-[#135bec] rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                                    <Battery className="w-32 h-32 text-white relative z-10" strokeWidth={1.5} />
                                    <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-[#0e4ab8] to-transparent" />
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <motion.div
                                className="absolute top-10 right-10 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Zap className="w-10 h-10 text-[#135bec]" />
                            </motion.div>

                            <motion.div
                                className="absolute bottom-20 left-0 w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center"
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                            >
                                <Leaf className="w-12 h-12 text-[#135bec]" />
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
                        <h3 className="text-4xl font-bold mb-4 text-slate-900">
                            Tại sao chọn chúng tôi?
                        </h3>
                        <p className="text-slate-600 max-w-2xl mx-auto">
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
                                bgColor: "bg-white"
                            },
                            {
                                title: "Đổi pin nhanh chóng",
                                desc: "Thay thế pin hết với pin đầy chỉ trong vài giây, tiện lợi như đổ xăng.",
                                icon: Clock,
                                color: "from-emerald-500 to-green-500",
                                bgColor: "bg-white"
                            },
                            {
                                title: "An toàn tuyệt đối",
                                desc: "Hệ thống bảo mật và kiểm tra chất lượng pin tự động trước mỗi giao dịch.",
                                icon: Shield,
                                color: "from-purple-500 to-pink-500",
                                bgColor: "bg-white"
                            },
                            {
                                title: "Thân thiện môi trường",
                                desc: "Giảm thiểu khí thải carbon và thúc đẩy giao thông bền vững.",
                                icon: Leaf,
                                color: "from-green-500 to-emerald-500",
                                bgColor: "bg-white"
                            },
                            {
                                title: "Mạng lưới rộng khắp",
                                desc: "Hơn 500 trạm đổi pin trên toàn quốc, luôn sẵn sàng phục vụ.",
                                icon: MapPin,
                                color: "from-orange-500 to-red-500",
                                bgColor: "bg-white"
                            },
                            {
                                title: "Cộng đồng lớn mạnh",
                                desc: "Tham gia cùng hơn 50,000 tài xế đang sử dụng dịch vụ của chúng tôi.",
                                icon: Users,
                                color: "from-indigo-500 to-purple-500",
                                bgColor: "bg-white"
                            },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                className={`${item.bgColor} rounded-xl p-6 hover:shadow-xl transition-all transform hover:-translate-y-2 border border-slate-200`}
                                variants={fadeVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                            >
                                <div className={`w-16 h-16 rounded-lg bg-[#135bec]/20 flex items-center justify-center mb-6`}>
                                    <item.icon className="w-8 h-8 text-[#135bec]" strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="bg-white py-20 px-6 md:px-12 border-t border-slate-200">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col gap-6"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                            Đơn giản, Nhanh chóng & Tự động hoàn toàn
                        </h2>
                        <p className="text-slate-600 text-base md:text-lg">Quy trình đổi pin được tối ưu để bạn quay lại hành trình chỉ trong vài phút.</p>
                        <div className="grid grid-cols-[50px_1fr] gap-x-6">
                            {/* Bước 1 */}
                            <div className="flex flex-col items-center pt-2">
                                <div className="w-12 h-12 rounded-full bg-[#135bec]/15 text-[#135bec] flex items-center justify-center">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div className="w-px bg-slate-300 flex-1" />
                            </div>
                            <div className="pb-10 pt-2">
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">1. Tới trạm gần nhất</h3>
                                <p className="text-slate-600 text-sm md:text-base">Dùng hệ thống để tìm trạm gần bạn và vào khu vực đổi pin.</p>
                            </div>
                            {/* Bước 2 */}
                            <div className="flex flex-col items-center">
                                <div className="w-px bg-slate-300 flex-1" />
                                <div className="w-12 h-12 rounded-full bg-[#135bec]/15 text-[#135bec] flex items-center justify-center">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div className="w-px bg-slate-300 flex-1" />
                            </div>
                            <div className="pb-10 pt-4">
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">2. Hệ thống tự động xử lý</h3>
                                <p className="text-slate-600 text-sm md:text-base">Robot tháo pin cũ và thay pin mới đã sạc đầy một cách an toàn.</p>
                            </div>
                            {/* Bước 3 */}
                            <div className="flex flex-col items-center">
                                <div className="w-px bg-slate-300 flex-1" />
                                <div className="w-12 h-12 rounded-full bg-[#135bec]/15 text-[#135bec] flex items-center justify-center">
                                    <Battery className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="pt-4">
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">3. Tiếp tục hành trình</h3>
                                <p className="text-slate-600 text-sm md:text-base">Thanh toán tự động. Bạn rời trạm với pin đầy trong thời gian kỷ lục.</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full h-80 rounded-xl overflow-hidden shadow-lg"
                    >
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAunQjT2RjSV7vYaswznuOJJZGcLyon3zi2YVe3gziSPaJx63M3bhcFA_KVZ5mj2f7ok22jj4umhBAYLeUt47a1QND_ms3cW5uW-Kq9Li_vJ2xaRQNIQelG42k7BGnXBkusi9TgtMjP7cqHD9ORW-tMYxuTcw5N0vkgBqtqh0dhkf5l4n_sIj8WM12XSn1jTqLNH05TC8XzTgq65-Uvywdo8wdrv4FpBC7odAGis9I4rp3PLsSRnAPyopWYXK-sp5Tqs2FZKSm7sCo"
                            alt="Quy trình đổi pin tự động"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Station Map Preview Section */}
            <section id="locations" className="py-20 px-6 md:px-12 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Tìm trạm đổi pin gần bạn</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">Mạng lưới trạm đang mở rộng liên tục. Khám phá các điểm đang hoạt động ngay trên bản đồ.</p>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-7xl mx-auto"
                >
                    <div className="w-full h-[420px] rounded-xl border border-slate-300 overflow-hidden bg-slate-200">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPV5lW7-8x4ACnyyEo1vmDNAG8aABpfhvLGrMqpoD-h6FH_5UsBLb_Md2P0QzMt1dDEqoaDWecuE4hUpLARQG5XLwLjGBiX_JqUOK-YVdTt2HBS6Pkdk1HVjJ706JSS3hkltMVlyikSyg1WFL_ehgXu6ac5DUQjDOBLYrLxUZK14VY5inO_-NKDdAVVVg2C2RtBvbisEKK8zxo5Udkupp8XlLtjIM1HV7hbr3AwrDzuAkdtotZHJO_Qo0olke7FPMV1M1DZUGGCFQ"
                            alt="Bản đồ các trạm đổi pin"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </motion.div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 px-6 md:px-12 bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Khách hàng nói gì?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">Lắng nghe chia sẻ thực tế từ các tài xế EV đã trải nghiệm dịch vụ đổi pin nhanh.</p>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Anh Minh",
                                role: "Tài xế công nghệ",
                                quote: "Dịch vụ đổi pin nhanh giúp tôi không bỏ lỡ chuyến nào. Thời gian xử lý thật sự ấn tượng!",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2dp8pesy47QeohbLrmwuYyDaPbGLc0Euw8OHwa1MM0NneYbqRYRK6AbectOMl3Z5azxyb7toGTfN5dq98-HLju7x9o4gS6TlaGnh-t-7I_pm8kFj7_Y87Oh1NIF4uM-rBjcoQq6u39DcpXtkSFSSqYf69_F0pTnRdkGP7m6deiY0ztqoI9ep8eJlaSLUQcFDA3J83gdPhlHY6L9afjQcM0ig90ot_kiQtiqMkWEUCXOJKZdDqEc9d0D0nD1IPWpJbZMKOomA9gzA"
                            },
                            {
                                name: "Chị Hòa",
                                role: "Người đi làm",
                                quote: "Không còn lo hết pin giữa đường. Tôi yên tâm hơn rất nhiều trên các tuyến dài.",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm3SCSbUlskrmbAsul7qJ3iMUO-KmTEseMFXyQx_9JfghuFuS7ijB6nGrHrX2STUTxa6KGrI1zHT5exULWbeRd3Egs7PSXjHoao67hNKJvJ5rNM942XjYgGpt2BHuG3bN1_HwRdUVpH4qKK5QYYnobkBQNEoB1Gc9-Zw67-8L3Pu3S7sIFSHMTiGrd0nrQ65zfmFZQXzUA8eQ6BC1hvgd78qbeEzpVHfk9zQ_PkFVMHYBr27xrALPI6U-BV6U3wzFF0NGSO6PLI1k"
                            },
                            {
                                name: "Bạn Tuấn",
                                role: "Người đam mê EV",
                                quote: "Mô hình đăng ký tiết kiệm nhiều chi phí bảo dưỡng pin. Tôi rất hài lòng!",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCS7M74O3atDVoe0P407CYMPi4UI8t3mlYTFiTesbuEdEbS3n_ml2AeodC1lTIfeSqrxcuVwHflL8EHjrLJfX50KsdxW1ec2MHZK0oCoSmxaDI3kpc96oilvDD2E2qNkSL7qRlANXNoDlsmCHYVpS9V_mBaqzqfeR3aUbcROgI8ajbnr1J3q5OxMW9p58YXh7082UoZnxhnhh37S16jnwFgd8CH6bC-1dd96H71dIMC7QSAaKjxLrWoq3jjmS4-YzrAu1RZTaeg9d4"
                            }
                        ].map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <p className="font-semibold text-slate-900">{t.name}</p>
                                        <p className="text-xs text-slate-500">{t.role}</p>
                                    </div>
                                </div>
                                <blockquote className="text-sm text-slate-600 leading-relaxed">“{t.quote}”</blockquote>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 md:px-12 bg-[#135bec] relative overflow-hidden">
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
                            className="px-10 py-4 bg-white text-[#135bec] rounded-lg font-bold hover:shadow-2xl hover:scale-105 transition-all text-lg"
                        >
                            Đăng ký ngay
                        </button>
                        <button className="px-10 py-4 bg-white/20 backdrop-blur-sm text-white rounded-lg font-bold hover:bg-white/30 transition-all text-lg border-2 border-white/50">
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